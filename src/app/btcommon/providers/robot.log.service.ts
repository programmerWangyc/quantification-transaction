import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/race';
import 'rxjs/add/operator/switchMapTo';
import 'rxjs/add/operator/withLatestFrom';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { includes, isArray, isNumber, isObject, omit, take } from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import {
    ServerSendRobotEventType,
    StrategyChartData,
    StrategyChartPoint,
    StrategyChartSeriesData,
} from '../../interfaces/constant.interface';
import { ChangeLogPageAction, MonitorSoundTypeAction, ToggleMonitorSoundAction } from '../../store/robot/robot.action';
import * as fromReq from './../../interfaces/request.interface';
import * as fromRes from './../../interfaces/response.interface';
import { ChartService } from './../../providers/chart.service';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
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
        private robotService: RobotService,
        private chartService: ChartService,
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
     * TODO: 还有chart的参数要改
     */
    launchSyncLogsWhenServerRefreshed(): Subscription {
        // 获取一套新的日志请求参数。
        const newLogParam = this.getLogParamsFroSyncLogs()
            .zip(
                this.robotService.getCurrentRobotId(),
                this.getProfitParamsForSyncLogs(),
                (logMinId, robotId, profitParam) => ({ robotId, logMinId, ...profitParam, chartLimit: 0 })
            );

        // 收到服务器更新通知---> 确保当前状态可以发送请求---->跳转到参数流上获取参数
        const syncNotify = this.needSyncLogs()
            .withLatestFrom(
                this.canSyncLogs(),
                this.robotService.isLoading(),
                (need, can, isLoading) => need && can && !isLoading
            )
            .filter(v => v)

        return this.launchRobotLogs(syncNotify.switchMapTo(newLogParam), true, true);
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
                this.getSyncRobotLogsResponse().map(res => res ? res.result.runningLog.Arr : []).scan((acc, cur) => [...cur, ...acc], []),
                this.getCurrentPage().map(page => page === 0),
                (logs, newLogs, isFirstPage) => newLogs.length && isFirstPage ? this.updateLogs(logs, newLogs) : logs
            );
    }

    getSemanticsRobotProfitLogs(): Observable<fromRes.ProfitLog[]> {
        return this.getRobotLogs()
            .map(res => res.profitLog.Arr);
    }

    getSemanticsRobotStrategyLogs(): Observable<StrategyChartData[]> {
        return this.getRobotLogs()
            .mergeMap(res => Observable.from(res.strategyLog.Arr)
                .groupBy(item => item.seriesIdx)
                .mergeMap(obs => obs.map(item => this.restoreStrategyChartData(item)).reduce((acc, cur) => {
                    if (isNaN(acc.seriesIdx)) return { seriesIdx: cur.seriesIdx, data: [cur] };

                    acc.data.push(cur);

                    return acc;
                }, { seriesIdx: NaN, data: [] }))
                .map(({ seriesIdx, data }) => ({ seriesIdx, data: data.reverse().map(item => omit(item, 'seriesIdx')) }))
                .reduce((acc, cur) => [...acc, cur], [])
            );
    }

    getStrategyChartOptions(): Observable<Highcharts.Options[]> {
        return this.getRobotLogs()
            .map(res => {
                const data = JSON.parse(res.chart.replace(/useHTML/gi, '__disableHTML'));

                return isArray(data) ? data : [data] as Highcharts.Options[];
            })
            .withLatestFrom(
                this.getSemanticsRobotStrategyLogs(),
                (options, logs) => this.chartService.getRobotStrategyLogsOptions(options, logs)
            );
    }

    restoreStrategyChartData(log: fromRes.StrategyLog): StrategyChartPoint {
        const data = log.data;

        let result = { id: log.id, seriesIdx: log.seriesIdx };

        if (isObject(data) && !isArray(data)) return { ...result, ...data };

        if (isNumber(data)) return { ...result, y: data };

        const info = { x: data[0] };

        if (data.length < 5) {
            return { ...result, ...info, y: data[1] }
        } else {
            return {
                ...result,
                ...info,
                open: data[StrategyChartSeriesData.OPEN],
                close: data[StrategyChartSeriesData.CLOSE],
                high: data[StrategyChartSeriesData.HIGH],
                low: data[StrategyChartSeriesData.LOW]
            };
        }
    }

    hasProfitLogs(): Observable<boolean> {
        return this.getSemanticsRobotProfitLogs().map(res => !!res.length);
    }

    /**
     * 1、自动获取的不一定比手动获取的更新，如手动获取发生在自动获取之后恰好日志又有更新时。
     * 2、只有通过比较手动获取和自动获取的Max值，其中较大者才一定是客户端所知道的最新的ID。
     */
    getLogParamsFroSyncLogs(): Observable<number> {
        return this.getRobotLogs().map(res => res.runningLog)
            .combineLatest(
                this.getSyncRobotLogsResponse().map(res => res && res.result.runningLog),
                (manual, automatic) => automatic ? Math.max(manual.Max, automatic.Max) : manual.Max
            )
            .distinctUntilChanged();
    }

    getProfitParamsForSyncLogs(): Observable<{ profitMinId: number, profitLimit: number }> {
        return this.getRobotLogs().map(res => res.profitLog)
            .combineLatest(
                this.getSyncRobotLogsResponse().map(res => res && res.result.profitLog),
                (manual, automatic) => automatic ? Math.max(manual.Max, automatic.Max) : manual.Max
            )
            .distinctUntilChanged()
            .withLatestFrom(this.getProfitMaxPoint(), (profitMinId, profitLimit) => ({ profitMinId, profitLimit }));
    }

    getProfitChartOptions(): Observable<Highstock.Options> {
        return this.getSemanticsRobotProfitLogs()
            .map(data => this.chartService.getRobotProfitLogsOptions(data.map(item => [item.time, item.profit]).reverse() as [number, number][]))
    }

    needPlayTipAudio(): Observable<boolean> {
        return this.getSyncRobotLogsResponse()
            .filter(res => !!res && !!res.result.runningLog.Arr.length)
            .mergeMap(res => this.getRobotLogMonitoringSoundTypes().map(types => includes(types, res.result.runningLog.Arr[0].logType)))
            .withLatestFrom(
                this.getRobotLogMonitorSoundState(),
                (hasValidType, isMonitorOpen) => hasValidType && isMonitorOpen
            );
    }

    /**
     * @description Create the statistics label of log, depending on the log's total amount that from serve and the limit that from view.
     */
    getRobotLogPaginationStatistics(): Observable<string> {
        return this.getLogsTotal()
            .combineLatest(this.getRobotLogDefaultParams().map(param => param.logLimit), (total, page) => ({ total, page: Math.ceil(total / page) }))
            .switchMap(({ total, page }) => this.translate.get('PAGINATION_STATISTICS', { total, page }))
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

    getProfitMaxPoint(): Observable<number> {
        return this.store.select(fromRoot.selectRobotProfitMaxPoint);
    }

    getStrategyMaxPoint(): Observable<number> {
        return this.store.select(fromRoot.selectRobotStrategyMaxPoint);
    }

    getStrategyUpdateTime(): Observable<string> {
        return this.getRobotLogsResponse()
            .merge(this.getSyncRobotLogsResponse().filter(v => !!v))
            .map(res => moment(res.result.chartTime).format('YYYY-MM-DD HH:mm:ss'));
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

    addStartPlotLine(chart: Observable<Highstock.ChartObject>): Subscription {
        return this.robotService.getRobotDetail()
            .map(robot => robot.start_time)
            .distinctUntilChanged()
            .withLatestFrom(chart)
            .subscribe(([startTime, chart]) => {
                console.log(startTime, chart)
                const id = 'plot-line-1';

                const xAxisHead = chart.xAxis[0];

                xAxisHead.removePlotLine(id);

                xAxisHead.addPlotLine({
                    color: '#FF0000',
                    width: 2,
                    dashStyle: 'hot',
                    value: moment(startTime).unix() * 1000,
                    id
                })
            });
    }

    addProfitPoints(chart: Highstock.ChartObject): Subscription {
        return this.getSyncRobotLogsResponse()
            .filter(res => !!res && !!res.result.profitLog.Arr.length)
            .map(res => res.result.profitLog.Arr)
            .withLatestFrom(this.getProfitMaxPoint())
            .subscribe(([points, maxPoints]) => {
                const needShift = points.length + chart.series[0].data.length > maxPoints

                points.forEach(item => chart.series[0].addPoint([item.time, item.profit], false, needShift));

                chart.redraw();
            });
    }

    getProfitChartTotal(): Observable<number> {
        return this.getRobotLogs()
            .map(res => res.profitLog.Total)
            .merge(this.getSyncRobotLogsResponse().filter(v => !!v).map(res => res.result.profitLog.Total));
    }

    getStrategyChartTotal(): Observable<number> {
        return this.getRobotLogs()
            .map(res => res.strategyLog.Total)
            .merge(this.getSyncRobotLogsResponse().filter(v => !!v).map(res => res.result.strategyLog.Total));
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
    }

    /**
     * @description Whether need to sync log with server;
     */
    private needSyncLogs(): Observable<boolean> {
        return this.robotService.getServerSendRobotMessageType(ServerSendRobotEventType.UPDATE_REFRESH)
            // .merge(this.robotService.getServerSendRobotMessageType(ServerSendRobotEventType.UPDATE_SUMMARY))
            .mapTo(true);
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
        const result = newLogs.filter(item => this.isFresh(logs[0], item));

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
