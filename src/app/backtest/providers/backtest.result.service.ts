import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as fileSaver from 'file-saver';
import { head, isEmpty, isNull, isNumber, isObject, last, range, zip as lodashZip } from 'lodash';
import * as moment from 'moment';
import { concat, from, merge, of, zip } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import {
    bufferCount,
    defaultIfEmpty,
    filter,
    map,
    mapTo,
    mergeMap,
    min,
    reduce,
    startWith,
    switchMap,
    take,
    withLatestFrom,
} from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as fromRes from '../../interfaces/response.interface';
import { UtilService } from '../../providers/util.service';
import { BacktestOperateCallbackId } from '../../store/backtest/backtest.action';
import { UIState } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { Eid2StringPipe, ExtraContentPipe, LogPricePipe, LogTypePipe } from '../../tool/pipes/log.pipe';
import { ServerBacktestCode } from '../backtest.config';
import {
    BacktestAccount,
    BacktestAssetsAndTime,
    BacktestLogResult,
    BacktestMaxDrawDownDescription,
    BacktestProfitDescription,
} from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';

export interface MaxDrawdownResultFn {
    (maxDrawdown: number, [time, profit]: [number, number]): number;
}

export interface BacktestResultFilterer {
    (res: fromRes.BacktestResult): boolean;
}

/**
 * 获取收益，递归查找所有的 'Long' ，'Short' 字段，将各字段的值进行累积。
 * @param data 查找的对象
 * @param initial 计算的初始值
 * @returns 收益的统计结果对象
 */
export function getProfit(data: Object, initial: { Profit: number; Margin: number }): { Profit: number; Margin: number } {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (key === 'Long' || key === 'Short') {
            const { Profit, Margin } = <fromRes.BacktestResultSymbolProfit>value

            return { Profit: acc.Profit + Profit, Margin: acc.Margin + Margin };
        } else if (isObject(value)) {
            const { Profit, Margin } = getProfit(value, acc);

            return { Profit: acc.Profit + Profit, Margin: acc.Margin + Margin };
        } else {
            return acc;
        }
    }, initial);
}

/**
 * 回测服务的基类；
 */
export class BacktestBaseService extends BaseService {
    constructor(
        public store: Store<fromRoot.AppState>,
    ) {
        super();
    }

    /**
     * 获取回测接口的响应，如果传入回测的callbackId，则只会获取到指定的响应，否则将会获取到所有通过backtestIO接口接收到的响应。
     */
    protected getBacktestIOResponse(callbackId?: string): Observable<fromRes.BacktestIOResponse> {
        return this.store.pipe(
            select(fromRoot.selectBacktestIOResponse),
            this.filterTruth(),
            filter(res => !!res && (callbackId ? res.action === callbackId : true))
        );
    }

    /**
     * 获取回测结果，包括服务端的回测结果及webworker中的回测结果；
     */
    getBacktestResult(): Observable<WorkerBacktest.WorkerResult> {
        return this.getBacktestIOResponse(BacktestOperateCallbackId.result).pipe(
            map(res => {
                const { Result } = <fromRes.ServerBacktestResult<string>>res.result;

                if (!Result) {
                    return null;
                } else {
                    return <fromRes.BacktestResult>JSON.parse(Result);
                }
            }),
            this.filterTruth()
        );
    }

    /**
     * 获取回测的ui状态。
     */
    getUIState(): Observable<UIState> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState)
        );
    }

    /**
     * 取出 Observable 中的结果;
     */
    protected unwrap<T>(obs: Observable<T>): T {
        let result = null;

        obs.subscribe(res => result = res);

        return result;
    }
}




/**
 * 注意：这个服务不可被注入，如需使用服务上的方法，使用其子类： BacktestChartService；
 */
export class BacktestResultService extends BacktestBaseService {
    PERIOD = 24 * 60 * 60 * 1000;

    constructor(
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
        public translate: TranslateService,
        public utilService: UtilService,
    ) {
        super(store);
    }

    // ==============================================Shortcut methods============================================

    /**
     * 是否允许用户下载回测结果。只有当回测完成并且有结果供下载时才可以下载。
     */
    canSaveResult(): Observable<boolean> {
        return this.getUIState().pipe(
            map(state => state.backtestMilestone),
            withLatestFrom(
                this.store.pipe(
                    select(fromRoot.selectBacktestResults),
                ),
                (milestone, results) => isNull(milestone) && !!results && !!results.length
            )
        );
    }

    /**
     * The name of the file to be download;
     */
    private createFileName(start: number, end: number): string {
        return moment(start).format('YYYYMMDDhhmmss').replace(/[\-\s:]/g, '') + "_" + moment(end).format('YYYYMMDDhhmmss').replace(/[\-\s:]/g, '') + ".csv"
    }

    /**
     * 获取回测完成的结果。
     * @param ignore 结果的过滤函数，接收Code作为参数，当响应的code满足指定条件时将被忽略，输出null。
     */
    getBacktestResults(ignore?: (code: number) => boolean): Observable<fromRes.BacktestResult[]> {
        return this.store.pipe(
            select(fromRoot.selectBacktestResults),
            this.filterTruth(),
            map(results => results.map(result => {
                const response = (<fromRes.ServerBacktestResult<string>>result.result);

                return result.error || ignore && ignore(response.Code) ? null : <fromRes.BacktestResult>JSON.parse(response.Result);
            }))
        );
    }

    /**
     * 当是任务是否已经成功或存在
     */
    private isTaskSuccessOrExist(code: number): boolean {
        return code === ServerBacktestCode.SUCCESS || code === ServerBacktestCode.ALREADY_EXIST;
    }

    //================================================Backtest status panel===============================================

    /**
     * 获取回测的统计数据。
     * @param statisticKey 字段名称
     */
    getBacktestStatistics(statisticKey: string, filterer: BacktestResultFilterer = res => res.Finished): Observable<number> {
        return this.getBacktestResults(code => code !== ServerBacktestCode.SUCCESS).pipe(
            switchMap(results => from(results).pipe(
                this.filterTruth(),
                filter(filterer),
                map(result => {
                    const statisticRes = result[statisticKey];

                    if (isNumber(statisticRes)) {
                        return statisticRes;
                    } else {
                        throw new TypeError(`The statistic result of ${statisticKey} is not a number.`)
                    }
                }),
                reduce((acc, cur) => acc + cur, 0)
            ))
        );
    }

    /**
     * 获取回测的进度。
     */
    getBacktestProgress(): Observable<number> {
        return this.getUIState().pipe(
            map(state => state.isOptimizedBacktest),
            switchMap(isOptimize => isOptimize ? this.getOptimizedBacktestProgress() : this.getNormalBacktestProgress())
        );
    }

    /**
     * 非调优状态下回测时，显示 回测状态的 Progress 字段的值；
     */
    private getNormalBacktestProgress(): Observable<number> {
        const middleStatus = this.store.pipe(
            select(fromRoot.selectBacktestState),
            map(state => state.GetTaskStatus),
            filter(state => !!state && !isNumber(state) && this.isTaskSuccessOrExist(state.Code)),
            map((status: fromRes.ServerBacktestResult<string>) => {
                const { Code, Result } = status;

                const result = <fromRes.BacktestResult>JSON.parse(Result);

                return result.Progress;
            })
        );

        const completeStatus = this.getBacktestResults().pipe(
            switchMap(results => from(results).pipe(
                filter(result => result.Finished),
                map(result => result.Progress),
                take(1)
            ))
        );

        return merge(middleStatus, completeStatus);
    }

    /**
     * 调优状态下回测，显示 已完成的任务 / 任务总数；
     */
    private getOptimizedBacktestProgress(): Observable<number> {
        return this.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            map(state => state.backtestTasks.length || 1),
            withLatestFrom(this.store.pipe(
                select(fromRoot.selectBacktestResults),
                this.filterTruth(),
                map(results => results.length)
            ),
                (total, completed) => (completed / total) * 100
            )
        );
    }

    /**
     * 获取交易次数，从各个包含 'TradeStatus' 字段的数据上统计交易次数。累积其sell， buy字段。
     * @param data 回测结果
     * @returns 交易总次数
     */
    private calTradeCount(data: fromRes.BacktestResult): number {
        const { TradeStatus, Snapshort, Snapshorts } = data;

        const acc = (acc: number, cur: number) => acc + cur;

        const cal = (data: fromRes.BacktestResultTradeStatus): number => Object.values(data || {}).reduce(acc, 0);

        const calShort = (data: fromRes.BacktestResultSnapshot[]) => data ? data.map(item => cal(item.TradeStatus)).reduce(acc, 0) : 0;

        const calShorts = (data: fromRes.BacktestSnapShots[]) => data && data.length > 0 ? calShort(data[data.length - 1][1]) : 0;

        return cal(TradeStatus) + calShort(Snapshort) + calShorts(Snapshorts);
    }

    /**
     * 获取交易次数总计；
     */
    getTradeCount(): Observable<number> {
        return this.getBacktestResults(code => code !== ServerBacktestCode.SUCCESS).pipe(
            switchMap(results => from(results).pipe(
                filter(res => res.Finished),
                map(res => this.calTradeCount(res)),
                reduce((acc, cur) => acc + cur, 0)
            )),
            filter(count => !isNaN(count))
        );
    }

    /**
     * 获取当前正在回测的任务的序号
     */
    getIndexOfBacktestingTask(): Observable<number> {
        return this.getUIState().pipe(
            map(state => state.backtestingTaskIndex),
            filter(idx => !!idx),
            startWith(0)
        );
    }

    // ============================================================调优状态下的日志信息==================================================================

    /**
     * 获取日志表格的列名称，参数列需要根据用户选择的调优参数动态生成；
     */
    getBacktestLogCols(): Observable<string[]> {
        return this.getUIState().pipe(
            filter(state => state.backtestTasks && !!state.backtestTasks.length),
            map(state => head(state.backtestTasks).map(item => item.variableDes))
        );
    }

    /**
     * 获取日志表格中的每一行。也就是根据调优参数生成的每一个进行测试的任务的参数组合。
     */
    getBacktestLogRows(): Observable<number[][]> {
        return this.getUIState().pipe(
            filter(state => Array.isArray(state.backtestTasks)),
            map(state => state.backtestTasks.map(data => data.map(task => task.variableValue)))
        );
    }

    /**
     * 获取胜率；ProfitLogs 元素中后个收益大于前一个收益时，取胜结果加1，胜率 = 取胜结果 / 收益日志总数。
     */
    protected getWinningRate(source: BacktestProfitDescription[]): Observable<number> {
        if (!source || source.length === 0) {
            return of(0);
        } else {
            return from(source.map(item => item.profit)).pipe(
                bufferCount(2, 1),
                reduce((acc: [number][], cur: [number, number]) => [...acc, cur], []),
                map(res => {
                    const wins = res.length > 1 ? res.reduce((acc, cur) => {
                        if (cur.length === 1) {
                            return acc;
                        } else {
                            return acc + (cur[1] > cur[0] ? 1 : 0);
                        }
                    }, 1) : 1;

                    return wins / source.length;
                })
            );
        }
    }

    /**
     * 获取最大回撤的信息集合；
     * @param source 收益数据
     * @param isBalancePrior 苑取总资产时是否优先使用余额
     */
    protected getMaxDrawdown(source: BacktestProfitDescription[], isBalancePrior = false): Observable<BacktestMaxDrawDownDescription> {
        return this.getTotalAssets(isBalancePrior).pipe(
            take(1),
            map(totalAssets => {
                const initial: BacktestMaxDrawDownDescription = { maxAssets: totalAssets, startDrawdownTime: 0, maxDrawdown: 0, maxAssetsTime: 0, maxDrawdownTime: 0 };

                return source.reduce(({ startDrawdownTime, maxDrawdown, maxAssets, maxAssetsTime, maxDrawdownTime }, { time, profit }) => {
                    const currentAssets = profit + totalAssets;

                    if (currentAssets > maxAssets) {
                        maxAssets = currentAssets;

                        maxAssetsTime = time;
                    }

                    const drawDown = 1 - (profit + totalAssets) / maxAssets;

                    if (maxAssets > 0 && drawDown > maxDrawdown) {
                        maxDrawdown = drawDown;
                        maxDrawdownTime = time;
                        startDrawdownTime = maxAssetsTime;
                    }

                    return { startDrawdownTime, maxDrawdown, maxAssets, maxAssetsTime, maxDrawdownTime };
                }, initial);
            })
        );
    }

    /**
     * 获取总资产；默认优先使用余币的值。
     */
    protected getTotalAssets(isBalancePrior = false): Observable<number> {
        return this.getUIState().pipe(
            filter(state => !!state.platformOptions && !!state.platformOptions.length),
            map(state => {
                const { platformOptions } = state;

                const balance = platformOptions.reduce((acc, cur) => acc + cur.balance, 0);

                const remainCurrency = platformOptions.reduce((acc, cur) => acc + cur.remainingCurrency, 0);

                return isBalancePrior ? balance || remainCurrency : remainCurrency || balance;
            })
        );
    }

    /**
     * 计算回测任务的夏普比率
     * {@link www.baike.baidu.com} SharpeRatio = (E(Rp) - Rf) / oP  E(Rp): 投资组合预期报酬率 Rf:无风险利率；oP: 投资组合的标准差；
     */
    protected getSharpRatio(source: BacktestProfitDescription[]): Observable<number> {
        return this.getStandardDeviation(source).pipe(
            withLatestFrom(
                this.getAnnualizedReturns(source),
                (standardDeviation, annualizedReturns) => standardDeviation === 0 ? 0 : annualizedReturns / standardDeviation
            )
        );
    }

    /**
     * 计算标准差；
     */
    protected getStandardDeviation(source: BacktestProfitDescription[]): Observable<number> {
        return this.getRatio(source).pipe(
            defaultIfEmpty([]),
            map((radios: number[]) => {
                if (radios.length === 0 || radios.every(radio => radio === 0)) {
                    return 0;
                } else {
                    const total = radios.length;

                    const average = radios.reduce((acc, cur) => acc + cur) / total;

                    const variance = radios.reduce((acc, cur) => acc + Math.pow(cur - average, 2), 0) / total;

                    const standardDeviation = Math.sqrt(variance);

                    return standardDeviation;
                }
            })
        );
    }

    /**
     * 获取周期内的夏普比率。
     */
    private getRatio(source: BacktestProfitDescription[]): Observable<number[]> {
        return this.getTimeRange().pipe(
            withLatestFrom(
                this.getTotalAssets(true),
                this.getYearDays(),
                ({ start, end }, totalAssets, yearDays) => {
                    const finish = (end - start) % this.PERIOD > 0 ? Math.ceil(end / this.PERIOD) * this.PERIOD : end;

                    const getDayProfit = this.getDayProfit(source);

                    return range(start, finish, this.PERIOD).map(day => (getDayProfit(day + this.PERIOD) / totalAssets) * yearDays);
                }
            )
        );
    }

    /**
     * 获取日收益
     */
    private getDayProfit(source: BacktestProfitDescription[]): (end: number) => number {
        let i = 0;

        const len = source.length;

        return end => {
            let dayProfit = 0;

            for (; i < len && source[i].time < end; i++) {
                dayProfit = dayProfit + source[i].profit - (i > 0 ? source[i - 1].profit : 0);
            }

            return dayProfit;
        }
    }

    /**
     * 获取回测的时间周期
     */
    protected getTimeRange(): Observable<{ start: number; end: number }> {
        return this.getUIState().pipe(
            filter(state => !!state.timeOptions),
            map(({ timeOptions }) => {
                const { start, end } = timeOptions;

                const begin = moment(start).unix() * 1000;

                const finish = moment(end).unix() * 1000;

                return { start: begin, end: finish };
            })
        );
    }

    /**
     * 获取年化交易天数，使用回测交易平台中的最小值。
     */
    protected getYearDays(): Observable<number> {
        return this.getUIState().pipe(
            mergeMap(state => {
                const ids = state.platformOptions.map(item => item.eid);

                const platforms = this.constant.BACKTEST_PLATFORMS_CONFIG.filter(item => ids.includes(item.eid))

                return from(platforms).pipe(
                    min((pre, cur) => pre.yearDays - cur.yearDays),
                    map(({ yearDays }) => yearDays)
                );
            })
        );
    }

    /**
     * 获取年化预估收益
     */
    protected getAnnualizedReturns(source: BacktestProfitDescription[]): Observable<number> {
        if (isEmpty(source)) return of(0);

        const { profit } = last(source);

        return this.getAssetsAndTimeInfo(source).pipe(
            map(info => {
                if (!info) {
                    return 0;
                } else {
                    const { yearDays, start, end, totalAssets } = info;

                    return (profit / totalAssets) * yearDays * this.PERIOD / (end - start);
                }
            })
        );
    }

    /**
     * 获取时间值和收益值
     */
    protected getAssetsAndTimeInfo(source: BacktestProfitDescription[]): Observable<BacktestAssetsAndTime> {
        if (isEmpty(source)) {
            return of(null);
        }

        return zip(
            this.getYearDays(),
            this.getTimeRange(),
            this.getTotalAssets(true)
        ).pipe(
            map(([yearDays, { start, end }, totalAssets]) => ({ yearDays, start, end, totalAssets }))
        );
    }

    /**
     * 生成回测日志，数据来源于响应的Result字段， 如果发生错误，当前的回测结果为null。
     */
    getBacktestLogResults(): Observable<BacktestLogResult[]> {
        const generateLogResult = (data: fromRes.BacktestResult): BacktestLogResult => {
            const { Elapsed, Profit, ProfitLogs } = data;

            const profitLogs = ProfitLogs.map(([time, profit]) => ({ time, profit }));

            return {
                elapsed: Elapsed / this.constant.BACKTEST_RESULT_ELAPSED_RATE,
                profit: Profit,
                tradeCount: this.calTradeCount(data),
                winningRate: this.unwrap(this.getWinningRate(profitLogs)),
                maxDrawdown: this.unwrap(this.getMaxDrawdown(profitLogs)).maxDrawdown,
                sharpeRatio: this.unwrap(this.getSharpRatio(profitLogs)),
                returns: this.unwrap(this.getAnnualizedReturns(profitLogs))
            }
        }

        return this.getBacktestResults(code => code !== ServerBacktestCode.SUCCESS).pipe(
            map(results => results.map(result => !!result ? generateLogResult(result) : null))
        );
    }

    /**
     * 下载调优回测日志。
     */
    downloadLogs(): void {
        const head = zip(
            this.translate.get(['SEQUENCE_NUMBER', 'TIME_CONSUMING_WITH_UNIT', 'TRANSACTIONS', 'WINNING_RATE', 'MAXIMUM_WITHDRAWAL', 'SHARP', 'ESTIMATED_REVENUE', 'PROFIT']),
            this.getBacktestLogCols()
        ).pipe(
            map(([constantCol, dynamicCols]) => [
                constantCol.SEQUENCE_NUMBER,
                ...dynamicCols,
                constantCol.TIME_CONSUMING_WITH_UNIT,
                constantCol.TRANSACTIONS,
                constantCol.WINNING_RATE,
                constantCol.MAXIMUM_WITHDRAWAL,
                constantCol.SHARP,
                constantCol.ESTIMATED_REVENUE,
                constantCol.PROFIT,
            ])
        );

        const data = zip(
            this.getBacktestLogRows(),
            this.getBacktestLogResults()
        ).pipe(
            mergeMap(([tasks, results]) => zip(
                from(tasks),
                from(results)
            ).pipe(
                map(([task, result], index) => result ? [
                    index + 1,
                    ...task,
                    result.elapsed.toFixed(5),
                    result.tradeCount,
                    (result.winningRate * 100).toFixed(2) + '%',
                    (result.maxDrawdown * 100).toFixed(2) + '%',
                    result.sharpeRatio.toFixed(3),
                    result.returns.toFixed(5),
                    result.profit.toFixed(5)
                ] : [index + 1, ...task, ...new Array(7).fill('-')]),
                reduce((acc: number[][], cur: number[]) => [...acc, cur], [])
            )),
            take(1)
        );

        this.exportFile(
            concat(head, data),
            this.getTimeRange().pipe(
                map(({ start, end }) => 'optimize_' + this.createFileName(start, end))
            )
        );
    }

    /**
     * 导出文件；
     * @param source File content;
     * @param filename File name;
     */
    private exportFile(source: Observable<any[][]>, filename: Observable<string>): void {
        source.pipe(
            reduce((acc, cur) => [acc, ...cur]),
            map(data => data.join('\n')),
            withLatestFrom(filename)
        ).subscribe(([data, name]) => {
            fileSaver.saveAs(
                new Blob([data], { type: 'text/csv;charset=utf8;' }),
                name
            );
        });
    }

    // ============================================================非调优状态下的帐户信息==================================================================

    /**
     * 获取未调优状态下的回测结果。
     * @param futuresDataFilter: 期货的数据过滤器，用来在生成期货信息时过滤出有效的snapshot。
     */
    getBacktestAccountInfo(futuresDataFilter = (data: fromRes.BacktestResultSnapshot) => !!data.Symbols): Observable<BacktestAccount[]> {
        return this.getBacktestResult().pipe(
            map(data => {
                const { Exchanges } = data.Task;

                const { Snapshorts, Snapshort, Time } = data;

                const snapshotList = Snapshort ? <fromRes.BacktestSnapShots[]>[[Time, Snapshort]] : Snapshorts || [];

                const snapshots = lodashZip(...snapshotList.map(([time, snapshots]) => snapshots.map(item => ({ ...item, time } as fromRes.BacktestResultSnapshot))));

                return Exchanges.map((exchange, index) => {
                    const account = this.getAccountInitialInfo(exchange);

                    const source = snapshots[index];

                    return account.isFutures ? this.getFuturesAccount(account, source, futuresDataFilter) : this.getAccount(account, source);
                })
            })
        );
    }

    /**
     * 获取非期货的帐户信息；
     */
    private getAccount(account: BacktestAccount, source: fromRes.BacktestResultSnapshot[]): BacktestAccount {
        const subSnapshots = source.filter(this.curry2Right(this.isValidSnapshot)(account));

        const snapshot = last(subSnapshots);

        const returns = snapshot ? this.calculateProfit(snapshot, account) : 0;

        const commission = snapshot.Commission;

        const profitAndLose = subSnapshots.map(snapshot => ({ time: snapshot.time, profit: this.calculateProfit(snapshot, account) }));

        return { ...account, returns, commission, profitAndLose };
    }

    /**
     * 计算收益值；
     */
    private calculateProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): number {
        return snapshot.Balance + snapshot.FrozenBalance - account.initialBalance + (snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks) * snapshot.Symbols[account.symbol].Last;
    }

    /**
     * 获取期货的帐户信息；
     */
    private getFuturesAccount(account: BacktestAccount, source: fromRes.BacktestResultSnapshot[], filter: (data: fromRes.BacktestResultSnapshot) => boolean): BacktestAccount {
        const subSnapshots = source.filter(filter);

        const snapshot = last(subSnapshots);

        const { Profit, Margin } = subSnapshots.reduce((acc, cur) => cur.Symbols ? getProfit(cur.Symbols, acc) : acc
            , { Profit: 0, Margin: 0 });

        const returns = snapshot ? this.calculateFuturesProfit(snapshot, account, Profit + Margin) : 0;

        const profitAndLose = subSnapshots.map(snapshot => {
            const { Profit, Margin } = snapshot.Symbols ? getProfit(snapshot.Symbols, { Profit: 0, Margin: 0 }) : { Profit: 0, Margin: 0 };

            const profit = this.calculateFuturesProfit(snapshot, account, Profit + Margin);

            return { time: snapshot.time, profit };
        })

        return { ...account, positionProfit: Profit, currentMargin: Margin, commission: snapshot && snapshot.Commission || 0, returns, profitAndLose };
    }

    /**
     * 计算期货的收益值；
     */
    private calculateFuturesProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount, initial = 0): number {
        return account.isFuturesOkCoin ? initial + snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks :
            initial + snapshot.Balance + snapshot.FrozenBalance - account.initialBalance;
    }

    /**
     * 计算snapshot时的判定函数。
     */
    private isValidSnapshot(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): boolean {
        const { Symbols } = snapshot;

        return Symbols && <fromRes.BacktestResultSymbol>Symbols[account.symbol] && Symbols[account.symbol].Last;
    }

    /**
     * 生成帐户的初始信息。
     */
    protected getAccountInitialInfo(source: fromRes.BacktestResultExchange): BacktestAccount {
        const { Id, BaseCurrency, QuoteCurrency, Balance, Stocks } = source;

        const isFutures = Id.includes('Futures_');

        const isFuturesOkCoin = Id.includes('Futures_OKCoin');

        return {
            baseCurrency: BaseCurrency,
            commission: 0,
            currentMargin: 0,
            initialBalance: !isFuturesOkCoin ? Balance : null,
            initialStocks: Stocks,
            isFutures,
            isFuturesOkCoin,
            name: Id,
            positionProfit: 0,
            quoteCurrency: QuoteCurrency,
            returns: 0,
            symbol: [BaseCurrency, QuoteCurrency, Id].join('_'),
        }
    }

    // ============================================================非调优状态下的日志信息==================================================================

    /**
     * 获取回测的运行日志
     */
    private getRuntimeLogs(): Observable<fromRes.RuntimeLog[]> {
        return this.getBacktestResult().pipe(
            filter(({ RuntimeLogs }) => !!RuntimeLogs && !!RuntimeLogs.length),
            map(({ RuntimeLogs }) => RuntimeLogs)
        );
    }

    /**
     * 是否有产生的回测日志信息
     */
    hasRunningLogs(): Observable<boolean> {
        return this.getRuntimeLogs().pipe(
            mapTo(true)
        );
    }

    /**
     * 获取回测运行日志信息
     */
    getRunningLogs(): Observable<fromRes.RunningLog[]> {
        return this.getRuntimeLogs().pipe(
            map(logs => this.utilService.getRunningLogs(logs, true))
        );
    }

    /**
     * Download running logs
     */
    downloadRunningLog(): void {
        const head = this.translate.get(['TIME', 'PLATFORM', 'ORDER_ID', 'TYPE', 'PRICE', 'AMOUNT', 'INFORMATION']).pipe(
            map(res => [res.TIME, res.PLATFORM, res.ORDER_ID, res.TYPE, res.PRICE, res.AMOUNT, res.INFORMATION])
        );

        const data = this.getRunningLogs().pipe(
            map(logs => logs.map(log => {
                let { date, eid, orderId, logType, price, amount, extra } = log;

                const platform = new Eid2StringPipe(this.constant);

                const type = new LogTypePipe();

                const logPrice = new LogPricePipe(this.translate)

                const logExtra = new ExtraContentPipe();

                return [
                    date,
                    platform.transform(eid),
                    Number(orderId) > 0 ? orderId : '',
                    this.unwrap(this.translate.get(type.transform(logType))),
                    logPrice.transform(price, logType),
                    logType < 2 ? amount : '',
                    logExtra.transform(extra)
                ];
            })),
            take(1)
        );

        this.exportFile(
            concat(head, data),
            this.getTimeRange().pipe(
                map(({ start, end }) => this.createFileName(start, end))
            )
        );
    }
}
