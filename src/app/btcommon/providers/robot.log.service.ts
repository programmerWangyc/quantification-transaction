import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/distinctUntilKeyChanged';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty } from 'lodash';
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

    launchRobotLogs(data: Observable<{ [key: string]: number }>, allowSeparateRequest = true): Subscription {
        return this.process.processRobotLogs(
            data.withLatestFrom(
                this.store.select(fromRoot.selectRobotDefaultLogParams),
                (newParams, defaultParams) => ({ ...defaultParams, ...newParams })
            ),
            allowSeparateRequest
        );
    }

    /**
     * @description Refresh logs if user want to;
     */
    launchRefreshRobotLogs(flag: Observable<boolean>): Subscription {
        return this.launchRobotLogs(flag.switchMapTo(this.robotService.getRobotDetail().take(1).map(detail => ({ robotId: detail.id }))));
    }

    /**
     * @description Send requests to the server at regular intervals for the latest logs.
     * At this time ,we need not any other logs, so the limit filed of other logs has been set to 0.
     */
    launchGetLogsRegularly(): Subscription {
        const newLogParam = this.getRobotLogs()
            .filter(logs => !isEmpty(logs.runningLog.Arr))
            .map(({ runningLog }) => ({ logMinId: runningLog.Arr[0].id, profitLimit: 0, chartLimit: 0 }));

        const param = this.isAlreadyRefreshed()
            .filter(isRefreshed => !isRefreshed)
            .switchMapTo(newLogParam);

        return this.launchRobotLogs(this.canAutoRefreshLogs().switchMap(can => can ? Observable.interval(5000).switchMapTo(param) : Observable.empty()));
    }

    /* =======================================================Date Acquisition======================================================= */

    // regular logs
    private getRobotLogsResponse(): Observable<fromRes.GetRobotLogsResponse> {
        return this.store.select(fromRoot.selectRobotLogsResponse)
            .filter(res => !!res)
    }

    getRobotLogs(): Observable<fromRes.RobotLogs> {
        return this.getRobotLogsResponse()
            .map(res => res.result);
    }

    getSemanticsRobotRunningLogs(): Observable<fromRes.RunningLog[]> {
        return this.getRobotLogs()
            .map(res => res.runningLog.Arr);
    }

    /**
     * @description Create the statistics label of log, depending on the log's total amount that from serve and the limit that from view.
     */
    getRobotLogPaginationStatistics(): Observable<string> {
        return this.getRobotLogs()
            .map(log => log.runningLog.Total)
            .combineLatest(this.getRobotLogDefaultParams().map(param => param.logLimit), (total, page) => ({ total, page: Math.ceil(total / page) }))
            .switchMap(data => this.translate.get('PAGINATION_STATISTICS').map(label => this.utilService.replaceLabelVariable(label, data)))
            .distinctUntilChanged();
    }

    /**
     * @description Predicate whether the robot status need to refresh log automatically.
     */
    allowAutoRefreshLogs(): Observable<boolean> {
        return this.robotService.getRobotDetail()
            .map(robot => this.robotService.isNormalStatus(robot.status))
    }

    getCurrentPage(): Observable<number> {
        return this.store.select(fromRoot.selectRobotLogCurrentPage);
    }

    /**
     * @description Predicate whether the log can be synchronized.
     */
    canAutoRefreshLogs(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotLogCurrentPage)
            .map(page => page === 0)
            .combineLatest(
                this.allowAutoRefreshLogs(),
                (isFirstPage, allowAutoRefresh) => (isFirstPage && allowAutoRefresh)
            )
        // .do(v => console.log('can auto refresh logs: ', v));
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
    getRobotLogMonitoringSoundTypes(): Observable<number[]> {
        return this.store.select(fromRoot.selectRobotLogMonitoringSound)
            .map(data => data.logTypes);
    }

    /**
     * @description Whether need to sync log with server;
     */
    needSyncLog(): Observable<boolean> {
        return this.robotService.getServerSendRobotMessageType(ServerSendRobotEventType.UPDATE_STATUS).mapTo(true)
            .merge(this.robotService.getServerSendRobotMessageType(ServerSendRobotEventType.UPDATE_REFRESH).mapTo(true));
    }

    /**
     * @description Request parameter of getRobotLogs, corresponding to 'logOffset' field.
     */
    getLogOffset(): Observable<number> {
        return this.getCurrentPage()
            .combineLatest(this.getRobotLogDefaultParams(), (page, { logLimit }) => page * logLimit);
    }



    /* =======================================================Short cart method================================================== */


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
