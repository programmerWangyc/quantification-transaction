import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/distinctUntilChanged';
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
import { assignWith, compact, includes, isArray, last, omit, take, uniqBy } from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ChartUpdateIndicator, ServerSendRobotEventType } from '../../interfaces/constant.interface';
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
     */
    launchSyncLogsWhenServerRefreshed(): Subscription {
        // 获取一套新的日志请求参数。
        const newLogParam = this.getLogParamsFroSyncLogs()
            .zip(
                this.robotService.getCurrentRobotId(),
                this.getProfitParamsForSyncLogs(),
                this.getStrategyParamsForSyncLogs(),
                (logMinId, robotId, profitParam, strategyParam) => ({ robotId, logMinId, ...profitParam, ...strategyParam })
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

    getSyncRobotLogs(): Observable<fromRes.RobotLogs> {
        return this.getSyncRobotLogsResponse()
            .filter(v => !!v)
            .map(res => res.result);
    }

    getRobotLogDefaultParams(): Observable<fromReq.GetRobotLogsRequest> {
        return this.store.select(fromRoot.selectRobotDefaultLogParams);
    }

    /* =======================================================Running log ====================================================== */

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

    /* =======================================================Profit log ====================================================== */

    getSemanticsRobotProfitLogs(): Observable<fromRes.ProfitLog[]> {
        return this.getRobotLogs()
            .map(res => res.profitLog.Arr);
    }

    hasProfitLogs(): Observable<boolean> {
        return this.getSemanticsRobotProfitLogs().map(res => !!res.length);
    }

    getProfitParamsForSyncLogs(): Observable<{ profitMinId: number, profitLimit: number }> {
        return this.getRobotLogs()
            .map(res => res.profitLog)
            .combineLatest(
                this.getSyncRobotLogsResponse().map(res => res && res.result.profitLog),
                (manual, automatic) => automatic ? Math.max(manual.Max, automatic.Max) : manual.Max
            )
            .distinctUntilChanged()
            // TODO:limit没有控制， 原代码的逻辑当前不是第一页时把它重置成0， strategy也一样。
            .withLatestFrom(this.getProfitMaxPoint(), (profitMinId, profitLimit) => ({ profitMinId, profitLimit }));
    }

    getProfitChartOptions(): Observable<Highstock.Options> {
        return this.getSemanticsRobotProfitLogs()
            .map(data => this.chartService.getRobotProfitLogsOptions(data.map(item => [item.time, item.profit]).reverse() as [number, number][]))
    }

    getProfitMaxPoint(): Observable<number> {
        return this.store.select(fromRoot.selectRobotProfitMaxPoint);
    }

    //TODO: start line
    addStartPlotLine(chart: Observable<Highstock.ChartObject>): Subscription {
        return this.robotService.getRobotDetail()
            .map(robot => robot.start_time)
            .distinctUntilChanged()
            .withLatestFrom(chart)
            .subscribe(([startTime, chart]) => {

                const id = 'plot-line-1';

                const xAxisHead = chart.xAxis[0];

                xAxisHead.removePlotLine(id);

                xAxisHead.addPlotLine({
                    color: '#FF0000',
                    width: 2,
                    dashStyle: 'hot',
                    value: moment(startTime).unix() * 1000,
                    id
                });
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

    getProfitChartStatistics(): Observable<string> {
        return this.getProfitChartTotal()
            .withLatestFrom(this.getProfitMaxPoint())
            .mergeMap(([total, limit]) => this.translate.get('PAGINATION_STATISTICS', { total, page: Math.ceil(total / limit) }));
    }

    /* =======================================================Strategy log ====================================================== */

    //FIXME: unused
    private getSemanticsRobotStrategyLogs(): Observable<fromRes.StrategyLog[]> {
        return this.getStrategyChartOptionSourceData()
            .map(res => res.strategyLog.Arr);
    }

    private getStrategyChartOptionSourceData(): Observable<fromRes.RobotLogs> {
        return this.getRobotLogs()
            .combineLatest(
                this.getSyncRobotLogsResponse(),
                (manual, automatic) => !manual.chart && !!automatic && automatic.result.chart ? automatic.result : manual
            )
            .distinct()
            .filter(log => !!log.chart);
    }

    getStrategyChartOptions(): Observable<Highcharts.Options[]> {
        return this.getStrategyChartOptionSourceData()
            .mergeMap(res => {
                const data = JSON.parse(res.chart.replace(/useHTML/gi, '__disableHTML'));

                const options = Observable.of(isArray(data) ? data : [data] as Highcharts.Options[]);

                const logs = Observable.from(res.strategyLog.Arr)
                    .groupBy(item => item.seriesIdx)
                    .mergeMap(obs => obs.map(item => this.chartService.restoreStrategyChartData(item)).reduce((acc, cur) => isNaN(acc.seriesIdx)
                        ? { seriesIdx: cur.seriesIdx, data: [cur] } : { ...acc, data: [...acc.data, cur] }, { seriesIdx: NaN, data: [] }))
                    .map(({ seriesIdx, data }) => ({ seriesIdx, data: data.reverse().map(item => omit(item, 'seriesIdx')) }))
                    .reduce((acc, cur) => [...acc, cur], []);

                return options.zip(logs);
            })
            .map(([options, logs]) => this.chartService.getRobotStrategyLogsOptions(options, logs))
    }

    hasStrategyChart(): Observable<boolean> {
        return this.getStrategyChartOptionSourceData().mapTo(true).startWith(false);
    }

    getStrategyMaxPoint(): Observable<number> {
        return this.store.select(fromRoot.selectRobotStrategyMaxPoint);
    }

    getStrategyUpdateTime(): Observable<string> {
        return this.getRobotLogs()
            .merge(this.getSyncRobotLogs().filter(res => !!res.chartTime))
            .map(res => moment(res.chartTime).format('YYYY-MM-DD HH:mm:ss'));
    }

    getStrategyChartTotal(): Observable<number> {
        return this.getRobotLogs()
            .merge(this.getSyncRobotLogs().filter(res => !!res.strategyLog.Total))
            .map(res => res.strategyLog.Total);
    }

    getStrategyChartStatistics(): Observable<string> {
        return this.getStrategyChartTotal()
            .withLatestFrom(this.getStrategyMaxPoint(), this.getStrategyUpdateTime())
            .mergeMap(([total, limit, time]) => this.translate.get('PAGINATION_STATISTICS_WITH_UPDATE_TIME', { total, page: Math.ceil(total / limit), time }))
    }

    getStrategyParamsForSyncLogs(): Observable<{ chartMinId: number; chartLimit: number; chartUpdateBaseId: number; chartUpdateTime: number }> {
        const getParam = (source: fromRes.RobotLogs) => {
            const strategy = source.strategyLog;

            const lastPoint = last(strategy.Arr);

            return { chartMinId: strategy.Max, chartUpdateBaseId: lastPoint ? lastPoint.id : 0, chartUpdateTime: source.chartTime };
        }

        return this.getRobotLogs()
            .combineLatest(
                this.getSyncRobotLogsResponse(),
                (manual, automatic) => automatic ? assignWith(getParam(manual), getParam(automatic.result), (manual, auto) => Math.max(manual, auto))
                    : getParam(manual)
            )
            .distinct()
            .withLatestFrom(this.getStrategyMaxPoint(), (source, chartLimit) => ({ ...source, chartLimit }));
    }

    updateStrategyCharts(charts: Observable<Highcharts.ChartObject[]>): Subscription {
        const flatten = (acc: ChartUpdateIndicator[], cur: ChartUpdateIndicator[]) => [...acc, ...cur];

        const getChartIndex = (data: ChartUpdateIndicator) => data.chartIndex;

        return this.updateStrategyChartLabel(charts)
            .zip(this.updateStrategyChartPoints(charts), this.updateStrategyChartSeries(charts))
            .filter(result => result.some(item => !!item))
            .mergeMap(result => Observable.from(compact(result).reduce(flatten))
                .groupBy(item => item.chartIndex)
                .mergeMap(obs => obs.filter(item => item.updated).reduce((acc, cur) => [...acc, cur], []))
                .reduce(flatten)
            )
            .withLatestFrom(charts)
            .subscribe(([result, charts]) => uniqBy(result, getChartIndex).map(getChartIndex).forEach(idx => charts[idx].redraw()));
    }

    private updateStrategyChartLabel(charts: Observable<Highcharts.ChartObject[]>): Observable<ChartUpdateIndicator[]> {
        return this.getSyncRobotLogs()
            .withLatestFrom(this.getRobotLogs(), charts)
            .map(([automatic, manual, charts]) => this.chartService.updateRobotStrategyChartLabel(charts, automatic, manual));
    }

    private updateStrategyChartPoints(charts: Observable<Highcharts.ChartObject[]>): Observable<ChartUpdateIndicator[]> {
        return this.getDbMinId()
            .withLatestFrom(charts)
            .map(([ids, charts]) => this.chartService.updateRobotStrategyChartPoints(charts, ids));
    }

    private updateStrategyChartSeries(charts: Observable<Highcharts.ChartObject[]>): Observable<ChartUpdateIndicator[]> {
        return this.getSyncRobotLogs()
            .map(res => res.strategyLog.Arr)
            .withLatestFrom(this.getStrategyMaxPoint(), charts)
            .map(([logs, maxPoint, charts]) => this.chartService.updateRobotStrategyChartSeries(charts, logs, maxPoint))
    }

    private getDbMinId(): Observable<number[]> {
        return this.getRobotLogs()
            .merge(this.getSyncRobotLogs())
            .map(res => res.strategyLog.Min)
            .bufferCount(2, 1);
    }

    /* =======================================================Short cart method================================================== */

    //TODO: unused
    isAlreadyRefreshed(): Observable<boolean> {
        return this.getRobotLogs().map(log => log.updateTime > 0);
    }

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
            .withLatestFrom(this.robotService.getRobotDetail(), (msg, robot) => msg.id === robot.id);
    }

    /**
     * 
     * @param headLog The first data of the log that user actively pulls.
     * @param compareLog After the server notification, the program automatically obtains information.
     * @description Wether the log is fresh. If the log's date is behind the latest log by user obtains, it's fresh, otherwise not.
     */
    private isFresh(headLog: fromRes.RunningLog, compareLog: fromRes.RunningLog): boolean {
        return headLog ? headLog.date < compareLog.date : true;
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
