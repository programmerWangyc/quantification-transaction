import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { assignWith, compact, includes, isArray, last, omit, take, uniqBy } from 'lodash';
import * as moment from 'moment';
import { combineLatest, from as observableFrom, merge, Observable, of as observableOf, Subscription, zip } from 'rxjs';
import {
    bufferCount, distinct, distinctUntilChanged, filter, groupBy, map, mapTo, mergeMap, reduce, scan, startWith,
    switchMapTo, take as observableTake, takeWhile, withLatestFrom
} from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { ChartUpdateIndicator, keepAliveFn } from '../interfaces/app.interface';
import * as fromReq from '../interfaces/request.interface';
import * as fromRes from '../interfaces/response.interface';
import { RobotService } from '../robot/providers/robot.service';
import { ServerSendRobotEventType } from '../robot/robot.config';
import * as fromRoot from '../store/index.reducer';
import {
    ChangeLogPageAction, ChangeProfitChartPageAction, ChangeStrategyChartPageAction, ModifyDefaultParamsAction,
    MonitorSoundTypeAction, ToggleMonitorSoundAction
} from '../store/robot/robot.action';
import { ChartService } from './chart.service';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';

interface LogParam {
    [key: string]: number;
}

@Injectable()
export class RobotLogService extends BaseService {

    timeFormat = 'YYYY-MM-DD HH:mm:ss';

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private translate: TranslateService,
        private robotService: RobotService,
        private chartService: ChartService,
    ) {
        super();
    }

    launchRobotLogs(data: Observable<LogParam>, isSyncAction = false , distinctFn?: (pre: LogParam, cur: LogParam) => boolean): Subscription {
        const defaultFn = (pre, cur) => Object.keys(cur).every(key => pre[key] === cur[key]);

        const fn = distinctFn || defaultFn;

        return this.process.processRobotLogs(
            data.pipe(
                distinctUntilChanged(fn),
                withLatestFrom(
                    this.store.pipe(
                        select(fromRoot.selectRobotDefaultLogParams)
                    ),
                    this.store.pipe(
                        select(fromRoot.selectRobotLogRequestParameters),
                        map(req => req || {})
                    ),
                    (newParams, defaultParams, perviousParams) => ({ ...defaultParams, ...perviousParams, ...newParams })
                )
            ),
            isSyncAction
        );
    }

    launchRefreshRobotLogs(flag: Observable<boolean>): Subscription {
        return this.launchRobotLogs(flag.pipe(
            switchMapTo(
                this.robotService.getCurrentRobotId().pipe(
                    observableTake(1),
                    map(robotId => ({ robotId }))
                )
            )
        ), false, () => false);
    }

    launchSyncLogsWhenServerRefreshed(keepAlive: keepAliveFn): Subscription {
        const newLogParam = zip(
            this.getLogParamsFroSyncLogs(),
            this.robotService.getCurrentRobotId(),
            this.getProfitParamsForSyncLogs(),
            this.getStrategyParamsForSyncLogs(),
            (logMinId, robotId, profitParam, strategyParam) => ({ robotId, logMinId, ...profitParam, ...strategyParam })
        );

        const syncNotify = this.needSyncLogs().pipe(
            withLatestFrom(
                this.canSyncLogs(),
                this.robotService.isLoading('logsLoading'),
                (need, can, isLoading) => need && can && !isLoading
            ),
            this.filterTruth()
        );

        return this.launchRobotLogs(syncNotify.pipe(
            switchMapTo(newLogParam),
            takeWhile(keepAlive)
        ),
            true
        );
    }

    private getRobotLogsResponse(): Observable<fromRes.GetRobotLogsResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectRobotLogsResponse)
        );
    }

    private getSyncRobotLogsResponse(): Observable<fromRes.GetRobotLogsResponse> {
        return this.store.pipe(
            select(fromRoot.selectSyncRobotLogsResponse)
        );
    }

    getRobotLogs(): Observable<fromRes.RobotLogs> {
        return this.getRobotLogsResponse().pipe(
            map(res => res.result)
        );
    }

    getSyncRobotLogs(): Observable<fromRes.RobotLogs> {
        return this.getSyncRobotLogsResponse().pipe(
            filter(v => !!v),
            map(res => res.result)
        );
    }

    getRobotLogDefaultParams(): Observable<fromReq.GetRobotLogsRequest> {
        return this.store.pipe(
            select(fromRoot.selectRobotDefaultLogParams)
        );
    }

    getLogsTotal(key: string): Observable<number> {
        return combineLatest(
            this.getRobotLogs().pipe(
                map(res => res[key].Total)
            ),
            this.getSyncRobotLogsResponse().pipe(
                filter(v => !!v),
                map(res => res.result[key].Total),
                startWith(0),
            )
        ).pipe(
            map(([t1, t2]) => Math.max(t1, t2))
        );
    }

    isLoading(type?: string): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotUiState),
            map(state => type ? state[type] : state.loading)
        );
    }

    getSemanticsRobotRunningLogs(): Observable<fromRes.RunningLog[]> {
        return combineLatest(
            this.getRobotLogs().pipe(
                map(res => res.runningLog.Arr)
            ),
            this.getSyncRobotLogsResponse().pipe(
                map(res => res ? res.result.runningLog.Arr : []),
                scan((acc, cur) => [...cur, ...acc], []),
            ),
            this.canAddLogs()
        ).pipe(
            map(([logs, newLogs, isFirstPage]) => newLogs.length && isFirstPage ? this.updateLogs(logs, newLogs) : logs)
        );
    }


    private canAddLogs(): Observable<boolean> {
        return this.store.select(fromRoot.selectRobotRunningLogCurrentPage).pipe(
            map(this.isFirstPage)
        );
    }

    getLogParamsFroSyncLogs(): Observable<number> {
        return combineLatest(
            this.getRobotLogs().pipe(
                map(res => res.runningLog)
            ),
            this.getSyncRobotLogsResponse().pipe(
                map(res => res && res.result.runningLog)
            )
        ).pipe(
            map(([manual, automatic]) => automatic ? Math.max(manual.Max, automatic.Max) : manual.Max),
            distinctUntilChanged()
        );
    }

    needPlayTipAudio(): Observable<boolean> {
        return this.getSyncRobotLogsResponse().pipe(
            filter(res => !!res && !!res.result.runningLog.Arr.length),
            mergeMap(res => this.getRobotLogMonitoringSoundTypes().pipe(
                map(types => includes(types, res.result.runningLog.Arr[0].logType))
            )
            ),
            withLatestFrom(
                this.getRobotLogMonitorSoundState(),
                (hasValidType, isMonitorOpen) => hasValidType && isMonitorOpen
            )
        );
    }

    getRobotLogMonitorSoundState(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotLogMonitoringSound),
            map(data => data.isMonitorOpen)
        );
    }

    getRobotLogMonitoringSoundTypes(): Observable<number[]> {
        return this.store.pipe(
            select(fromRoot.selectRobotLogMonitoringSound),
            map(data => data.logTypes)
        );
    }

    getLogPaginationInfo(): Observable<{ logOffset: number; logLimit: number; }> {
        return combineLatest(
            this.store.pipe(
                select(fromRoot.selectRobotRunningLogCurrentPage)
            ),
            this.getRobotLogDefaultParams()
        ).pipe(
            map(([page, { logLimit }]) => ({ logOffset: page * logLimit, logLimit }))
        );
    }

    //  =======================================================Profit log ======================================================

    getSemanticsRobotProfitLogs(): Observable<fromRes.ProfitLog[]> {
        return this.getRobotLogs().pipe(
            map(res => res.profitLog.Arr)
        );
    }

    hasProfitLogs(): Observable<boolean> {
        return this.getSemanticsRobotProfitLogs().pipe(
            map(res => !!res.length)
        );
    }

    getProfitParamsForSyncLogs(): Observable<{ profitMinId: number, profitLimit: number }> {
        return combineLatest(
            this.getRobotLogs().pipe(
                map(res => res.profitLog)
            ),
            this.getSyncRobotLogsResponse().pipe(
                map(res => res && res.result.profitLog)
            )
        ).pipe(
            map(([manual, automatic]) => automatic ? Math.max(manual.Max, automatic.Max) : manual.Max),
            distinctUntilChanged(),
            withLatestFrom(
                this.getProfitMaxPoint(),
                (profitMinId, profitLimit) => ({ profitMinId, profitLimit })
            )
        );
    }

    getProfitChartOptions(): Observable<Highstock.Options> {
        return this.getSemanticsRobotProfitLogs().pipe(
            map(data => this.chartService.getRobotProfitLogsOptions(data.map(item => [item.time, item.profit]).reverse() as [number, number][]))
        );
    }

    getProfitMaxPoint(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectRobotProfitMaxPoint)
        );
    }

    // TODO: start line
    addStartPlotLine(chartObs: Observable<Highstock.ChartObject>): Subscription {
        return this.robotService.getRobotDetail().pipe(
            map(robot => robot.start_time),
            distinctUntilChanged(),
            withLatestFrom(chartObs)
        ).subscribe(([startTime, chart]) => {

            const id = 'plot-line-1';

            const xAxisHead = chart.xAxis[0];

            xAxisHead.removePlotLine(id);

            xAxisHead.addPlotLine({
                color: '#FF0000',
                width: 2,
                dashStyle: 'hot',
                value: moment(startTime).unix() * 1000,
                id,
            });
        });
    }

    addProfitPoints(chartObs: Observable<Highstock.ChartObject>): Subscription {
        return this.getSyncRobotLogsResponse().pipe(
            filter(res => !!res && !!res.result.profitLog.Arr.length),
            map(res => res.result.profitLog.Arr),
            withLatestFrom(
                this.getProfitMaxPoint(),
                chartObs,
                this.canAddProfitPoint()
            ),
            filter(([, , , can]) => can)
        ).subscribe(([points, maxPoints, chart]) => {
            const needShift = points.length + chart.series[0].data.length > maxPoints;

            points.forEach(item => chart.series[0].addPoint([item.time, item.profit], false, needShift));

            chart.redraw();
        });
    }

    getProfitChartTotal(): Observable<number> {
        return merge(
            this.getRobotLogs().pipe(
                map(res => res.profitLog.Total),
            ),
            this.getSyncRobotLogsResponse().pipe(
                filter(v => !!v),
                map(res => res.result.profitLog.Total)
            )
        );
    }

    getProfitChartStatistics(): Observable<string> {
        return this.getProfitChartTotal().pipe(
            withLatestFrom(this.getProfitMaxPoint()),
            mergeMap(([total, limit]) => this.translate.get('PAGINATION_STATISTICS', { total, page: Math.ceil(total / limit) }))
        );
    }

    private canAddProfitPoint(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotProfitChartCurrentPage),
            map(this.isFirstPage)
        );
    }

    getProfitOffset(): Observable<number> {
        return combineLatest(
            this.store.pipe(
                select(fromRoot.selectRobotProfitChartCurrentPage)
            ),
            this.getRobotLogDefaultParams(),
        ).pipe(
            map(([page, { profitLimit }]) => page * profitLimit)
        );
    }


    private getStrategyChartOptionSourceData(): Observable<fromRes.RobotLogs> {
        return combineLatest(
            this.getRobotLogs(),
            this.getSyncRobotLogsResponse()
        ).pipe(
            map(([manual, automatic]) => !manual.chart && !!automatic && automatic.result.chart ? automatic.result : manual),
            distinct(),
            filter(log => !!log.chart)
        );
    }

    getStrategyChartOptions(): Observable<Highcharts.Options[]> {
        return this.getStrategyChartOptionSourceData().pipe(
            mergeMap(res => {
                const source = JSON.parse(res.chart.replace(/useHTML/gi, '__disableHTML'));

                const options = observableOf(isArray(source) ? source : [source] as Highcharts.Options[]);

                const logs = observableFrom(res.strategyLog.Arr).pipe(
                    groupBy(item => item.seriesIdx),
                    mergeMap(obs => obs.pipe(
                        map(item => this.chartService.restoreStrategyChartData(item)),
                        reduce((acc, cur) => isNaN(acc.seriesIdx) ? { seriesIdx: cur.seriesIdx, data: [cur] } : { ...acc, data: [...acc.data, cur] }, { seriesIdx: NaN, data: [] }),
                        map(({ seriesIdx, data }) => ({ seriesIdx, data: data.reverse().map(item => omit(item, 'seriesIdx')) })),
                    )),
                    reduce((acc, cur) => [...acc, cur], [])
                );

                return zip(options, logs);
            }),
            map(([options, logs]) => this.chartService.getRobotStrategyLogsOptions(options, logs))
        );
    }

    hasStrategyChart(): Observable<boolean> {
        return this.getStrategyChartOptionSourceData().pipe(
            mapTo(true),
            startWith(false)
        );
    }

    getStrategyMaxPoint(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectRobotStrategyMaxPoint)
        );
    }

    getStrategyUpdateTime(): Observable<string> {
        return merge(
            this.getRobotLogs(),
            this.getSyncRobotLogs().pipe(
                filter(res => !!res.chartTime)
            )
        ).pipe(
            map(res => moment(res.chartTime).format(this.timeFormat))
        );
    }

    getStrategyChartTotal(): Observable<number> {
        return merge(
            this.getRobotLogs(),
            this.getSyncRobotLogs().pipe(
                filter(res => !!res.strategyLog.Total)
            )
        ).pipe(
            map(res => res.strategyLog.Total)
        );
    }

    getStrategyChartStatistics(): Observable<string> {
        return this.getStrategyChartTotal().pipe(
            withLatestFrom(
                this.getStrategyMaxPoint(),
                this.getStrategyUpdateTime()
            ),
            mergeMap(([total, limit, time]) => this.translate.get('PAGINATION_STATISTICS_WITH_UPDATE_TIME', { total, page: Math.ceil(total / limit), time }))
        );
    }

    getStrategyParamsForSyncLogs(): Observable<{ chartMinId: number; chartLimit: number; chartUpdateBaseId: number; chartUpdateTime: number }> {
        const getParam = (source: fromRes.RobotLogs) => {
            const strategy = source.strategyLog;

            const lastPoint = last(strategy.Arr);

            return { chartMinId: strategy.Max, chartUpdateBaseId: lastPoint ? lastPoint.id : 0, chartUpdateTime: source.chartTime };
        };

        return combineLatest(
            this.getRobotLogs(),
            this.getSyncRobotLogsResponse()
        ).pipe(
            map(([manual, automatic]) => automatic ? assignWith(getParam(manual), getParam(automatic.result), (man, auto) => Math.max(man, auto))
                : getParam(manual)),
            distinct(),
            withLatestFrom(
                this.getStrategyMaxPoint(),
                (source, chartLimit) => ({ ...source, chartLimit })
            )
        );
    }

    updateStrategyCharts(charts: Observable<Highcharts.ChartObject[]>): Subscription {
        const flatten = <T>(acc: T[], cur: T[]) => [...acc, ...cur];

        const getChartIndex = (data: ChartUpdateIndicator) => data.chartIndex;

        return zip(
            this.updateStrategyChartLabel(charts),
            this.updateStrategyChartPoints(charts),
            this.updateStrategyChartSeries(charts)
        ).pipe(
            filter(result => result.some(item => !!item)),
            mergeMap(result => observableFrom(compact(result).reduce(flatten)).pipe(
                groupBy(item => item.chartIndex),
                mergeMap(obs => obs.pipe(
                    filter(item => item.updated),
                    reduce((acc, cur) => [...acc, cur], [])),
                ),
                reduce((acc, cur) => [...acc, ...cur], [])
            )),
            withLatestFrom(
                charts,
                this.canUpdateStrategyChart()
            ),
            filter(([, , can]) => can)
        ).subscribe(([result, chartArr]) => uniqBy(result, getChartIndex).map(getChartIndex).forEach(idx => chartArr[idx].redraw()));
    }

    private updateStrategyChartLabel(charts: Observable<Highcharts.ChartObject[]>): Observable<ChartUpdateIndicator[]> {
        return this.getSyncRobotLogs().pipe(
            withLatestFrom(
                this.getRobotLogs(),
                charts
            ),
            map(([automatic, manual, chartArr]) => this.chartService.updateRobotStrategyChartLabel(chartArr, automatic, manual))
        );
    }

    private updateStrategyChartPoints(charts: Observable<Highcharts.ChartObject[]>): Observable<ChartUpdateIndicator[]> {
        return this.getDbMinId().pipe(
            withLatestFrom(charts),
            map(([ids, chartArr]) => this.chartService.updateRobotStrategyChartPoints(chartArr, ids))
        );
    }

    private updateStrategyChartSeries(charts: Observable<Highcharts.ChartObject[]>): Observable<ChartUpdateIndicator[]> {
        return this.getSyncRobotLogs().pipe(
            map(res => res.strategyLog.Arr),
            withLatestFrom(this.getStrategyMaxPoint(), charts),
            map(([logs, maxPoint, chartArr]) => this.chartService.updateRobotStrategyChartSeries(chartArr, logs, maxPoint))
        );
    }

    private getDbMinId(): Observable<number[]> {
        return merge(
            this.getRobotLogs(),
            this.getSyncRobotLogs()
        ).pipe(
            map(res => res.strategyLog.Min),
            bufferCount(2, 1)
        );
    }

    private canUpdateStrategyChart(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotStrategyChartCurrentPage),
            map(this.isFirstPage)
        );
    }

    getStrategyOffset(): Observable<number> {
        return combineLatest(
            this.store.pipe(
                select(fromRoot.selectRobotStrategyChartCurrentPage)
            ),
            this.getRobotLogDefaultParams()
        ).pipe(
            map(([page, { chartLimit }]) => page * chartLimit)
        );
    }
    private isInValidStatusToSyncLogs(): Observable<boolean> {
        return this.robotService.getRobotDetail().pipe(
            map(robot => this.robotService.isNormalStatus(robot))
        );
    }

    private canSyncLogs(): Observable<boolean> {
        return combineLatest(
            combineLatest(
                this.canAddLogs(),
                this.canAddProfitPoint(),
                this.canUpdateStrategyChart()
            ).pipe(
                map(pages => pages.some(can => can))
            ),
            this.isInValidStatusToSyncLogs()
        ).pipe(
            map(([isFirstPage, allowAutoRefresh]) => (isFirstPage && allowAutoRefresh))
        );
    }

    private needSyncLogs(): Observable<boolean> {
        return this.robotService.getServerSendRobotMessageType(ServerSendRobotEventType.UPDATE_REFRESH).pipe(
            withLatestFrom(
                this.robotService.getRobotDetail(),
                (msg, robot) => msg.id === robot.id)
        );
    }

    private isFresh(headLog: fromRes.RunningLog, compareLog: fromRes.RunningLog): boolean {
        return headLog ? headLog.date < compareLog.date : true;
    }

    private updateLogs(logs: fromRes.RunningLog[], newLogs: fromRes.RunningLog[]): fromRes.RunningLog[] {
        const result = newLogs.filter(item => this.isFresh(logs[0], item));

        const amount = logs.length - result.length;

        if (amount > 0) {
            return [...result, ...take(logs, logs.length - result.length)];
        } else {
            return take(result, logs.length);
        }
    }

    private isFirstPage(page): boolean {
        return page === 0;
    }

    transformDebugLogToRunningLog(data: fromRes.DebugLog, id: number): fromRes.RunningLog {
        const { LogType, PlatformId, OrderId, Price, Amount, Extra, Time, Instrument, Direction } = data;

        return {
            id,
            logType: LogType,
            eid: PlatformId,
            orderId: OrderId,
            price: parseFloat(Price.toFixed(12)),
            amount: parseFloat(Amount.toFixed(6)),
            extra: Extra,
            date: moment(Time).format(this.timeFormat),
            contractType: Instrument,
            direction: Direction,
        };
    }

    //  =======================================================Local state modify==================================================

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

    changeProfitChartPage(page: number): void {
        this.store.dispatch(new ChangeProfitChartPageAction(page - 1));
    }

    changeStrategyChartPage(page: number): void {
        this.store.dispatch(new ChangeStrategyChartPageAction(page - 1));
    }

    //  =======================================================Error Handle=======================================================

    handleRobotLogsError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getRobotLogsResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
