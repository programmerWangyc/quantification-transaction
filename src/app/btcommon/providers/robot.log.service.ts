import 'rxjs/add/operator/race';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'rxjs/add/operator/first';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty, take, first, includes } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ServerSendRobotEventType } from '../../interfaces/constant.interface';
import { ChangeLogPageAction, MonitorSoundTypeAction, ToggleMonitorSoundAction } from '../../store/robot/robot.action';
import * as fromReq from './../../interfaces/request.interface';
import * as fromRes from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { UtilService } from './../../providers/util.service';
import * as fromRoot from './../../store/index.reducer';
import { ModifyDefaultParamsAction } from './../../store/robot/robot.action';
import { RobotService } from './robot.service';

@Injectable()
export class RobotLogService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private translate: TranslateService,
        private utilService: UtilService,
        private robotService: RobotService,
    ) {
    }

    /* =======================================================Serve Request======================================================= */

    launchRobotLogs(data: Observable<{ [key: string]: number }>, allowSeparateRequest = true, isSyncAction = false /* indicate the action is  sync action or not*/): Subscription {
        return this.process.processRobotLogs(
            data.withLatestFrom(
                this.store.select(fromRoot.selectRobotDefaultLogParams),
                (newParams, defaultParams) => ({ ...defaultParams, ...newParams })
            ),
            allowSeparateRequest,
            isSyncAction
        );
    }

    /**
     * @description Refresh logs if user want to;
     */
    launchRefreshRobotLogs(flag: Observable<boolean>): Subscription {
        return this.launchRobotLogs(flag.switchMapTo(this.robotService.getCurrentRobotId().take(1).map(robotId => ({ robotId }))));
    }

    /**
     * @description Get logs when the server notifies log updates.
     */
    launchSyncLogsWhenServerRefreshed(): Subscription {
        const newLogParam = this.getRobotLogs()
            .filter(logs => !isEmpty(logs.runningLog.Arr))
            .withLatestFrom(
                this.robotService.getCurrentRobotId(),
                ({ runningLog }, robotId) => ({ robotId, logMinId: runningLog.Arr[0].id, profitLimit: 0, chartLimit: 0 })
            );

        const canSync = this.needSyncLogs()
            .withLatestFrom(
                this.canSyncLogs(),
                this.robotService.isLoading(),
                (need, can, isLoading) => need && can && !isLoading
            );

        return this.launchRobotLogs(canSync.switchMapTo(newLogParam), true, true);
    }

    /* =======================================================Date Acquisition======================================================= */

    // regular logs
    private getRobotLogsResponse(): Observable<fromRes.GetRobotLogsResponse> {
        return this.store.select(fromRoot.selectRobotLogsResponse)
            .filter(res => !!res)
    }

    private getSyncRobotLogsResponse(): Observable<fromRes.GetRobotLogsResponse> {
        return this.store.select(fromRoot.selectSyncRobotLogsResponse);
    }

    getRobotLogs(): Observable<fromRes.RobotLogs> {
        return this.getRobotLogsResponse()
            .map(res => res.result);
    }

    /**
     * @description The log information retrieved here is the semantic version of the original log.
     */
    getSemanticsRobotRunningLogs(): Observable<fromRes.RunningLog[]> {
        return this.getRobotLogs()
            .map(res => res.runningLog.Arr)
            .combineLatest(
                this.getSyncRobotLogsResponse(),
                this.getCurrentPage().map(page => page === 0),
                (logs, newLogs, isFirstPage) => (!newLogs || !isFirstPage) ? logs : this.updateLogs(logs, newLogs.result.runningLog.Arr)
            );
    }

    needPlayTipAudio(): Observable<boolean> {
        return this.getSyncRobotLogsResponse()
            .filter(v => !!v)
            .switchMap(res => Observable.from(res.result.runningLog.Arr).first().map(item => item.logType))
            .mergeMap(logType => this.getRobotLogMonitoringSoundTypes().map(types => includes(types, logType)))
            .withLatestFrom(this.getRobotLogMonitorSoundState(), (hasValidType, isMonitorOpen) => hasValidType && isMonitorOpen)
    }

    /**
     * @description Create the statistics label of log, depending on the log's total amount that from serve and the limit that from view.
     */
    getRobotLogPaginationStatistics(): Observable<string> {
        return this.getLogsTotal()
            .combineLatest(this.getRobotLogDefaultParams().map(param => param.logLimit), (total, page) => ({ total, page: Math.ceil(total / page) }))
            .switchMap(data => this.translate.get('PAGINATION_STATISTICS').map(label => this.utilService.replaceLabelVariable(label, data)))
            .distinctUntilChanged();
    }

    isAlreadyRefreshed(): Observable<boolean> {
        return this.getRobotLogs()
            .map(log => log.updateTime > 0)
    }

    // default params
    getRobotLogDefaultParams(): Observable<fromReq.GetRobotLogsRequest> {
        return this.store.select(fromRoot.selectRobotDefaultLogParams);
    }

    // monitoring message
    getRobotLogMonitorSoundState(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotLogMonitoringSound)
            .map(data => data.isMonitorOpen);
    }

    getRobotLogMonitoringSoundTypes(): Observable<number[]> {
        return this.store.select(fromRoot.selectRobotLogMonitoringSound)
            .map(data => data.logTypes);
    }

    /**
     * @description Request parameter of getRobotLogs, corresponding to 'logOffset' field.
     */
    getLogOffset(): Observable<number> {
        return this.getCurrentPage()
            .combineLatest(this.getRobotLogDefaultParams(), (page, { logLimit }) => page * logLimit);
    }

    getCurrentPage(): Observable<number> {
        return this.store.select(fromRoot.selectRobotLogCurrentPage);
    }

    getLogsTotal(): Observable<number> {
        return this.getRobotLogs()
            .map(res => res.runningLog.Total)
            .combineLatest(
                this.getSyncRobotLogsResponse().filter(v => !!v).map(res => res.result.runningLog.Total).startWith(0),
                (t1, t2) => Math.max(t1, t2)
            );
    }

    /* =======================================================Short cart method================================================== */

    /**
     * @description Predicate whether the robot status need to refresh log automatically.
     */
    private isInValidStatusToSyncLogs(): Observable<boolean> {
        return this.robotService.getRobotDetail()
            .map(robot => this.robotService.isNormalStatus(robot.status))
    }

    /**
     * @description Predicate whether the log can be synchronized.
     */
    private canSyncLogs(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotLogCurrentPage)
            .map(page => page === 0)
            .combineLatest(
                this.isInValidStatusToSyncLogs(),
                (isFirstPage, allowAutoRefresh) => (isFirstPage && allowAutoRefresh)
            )
        // .do(v => console.log('can auto refresh logs: ', v));
    }

    /**
     * @description Whether need to sync log with server;
     */
    private needSyncLogs(): Observable<boolean> {
        return this.robotService.getServerSendRobotMessageType(ServerSendRobotEventType.UPDATE_REFRESH).do(v => console.log('refresh', v)).mapTo(true);
    }

    /**
     * 
     * @param headLog The first data of the log that user actively pulls.
     * @param compareLog After the server notification, the program automatically obtains information.
     * @description Wether the log is fresh. If the log's date is behind the latest log by user obtains, it's fresh, otherwise not.
     */
    private isFresh(headLog: fromRes.RunningLog, compareLog: fromRes.RunningLog): boolean {
        return headLog.date < compareLog.date;
    }

    /**
     * @description After the program automatically obtains logs, it updates the log information the user sees.;
     */
    private updateLogs(logs: fromRes.RunningLog[], newLogs: fromRes.RunningLog[]): fromRes.RunningLog[] {
        const headLog = first(logs);

        const result = newLogs.filter(item => this.isFresh(headLog, item));

        const amount = logs.length - result.length;

        if (amount > 0) {
            return [...result, ...take(logs, logs.length - result.length)];
        } else {
            return take(result, logs.length);
        }
    }
    /* =======================================================Local state modify================================================== */

    modifyDefaultParam(size: number, path: string[]): void {
        this.store.dispatch(new ModifyDefaultParamsAction(new Map().set(path, size)));
    }

    updateMonitoringSoundTypes(types: number[]): void {
        this.store.dispatch(new MonitorSoundTypeAction(types));
    }

    updateMonitorSoundState(state: boolean): void {
        this.store.dispatch(new ToggleMonitorSoundAction(state));
    }

    changeLogPage(page: number): void {
        // page index start from 0, but nz-zorro pagination start from 1, so need to decrease 1.
        this.store.dispatch(new ChangeLogPageAction(page - 1));
    }

    /* =======================================================Error Handle======================================================= */

    handleRobotLogsError(): Subscription {
        return this.error.handleResponseError(this.getRobotLogsResponse());
    }
}
