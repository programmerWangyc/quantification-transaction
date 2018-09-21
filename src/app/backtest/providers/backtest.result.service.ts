import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import * as fileSaver from 'file-saver';
import { head, isEmpty, isNull, isNumber, isObject, last, range, zip as lodashZip } from 'lodash';
import * as moment from 'moment';
import { concat, from, merge, of, zip } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import {
    bufferCount, defaultIfEmpty, filter, map, mapTo, mergeMap, min, reduce, startWith, switchMap, take, withLatestFrom
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
    BacktestAccount, BacktestAssetsAndTime, BacktestLogResult, BacktestMaxDrawDownDescription, BacktestProfitDescription
} from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';

export type MaxDrawdownResultFn = (maxDrawdown: number, [time, profit]: [number, number]) => number;

export type BacktestResultFilterer = (res: fromRes.BacktestResult) => boolean;

export function getProfit(data: Object, initial: { Profit: number; Margin: number }): { Profit: number; Margin: number } {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (key === 'Long' || key === 'Short') {
            const { Profit, Margin } = <fromRes.BacktestResultSymbolProfit>value;

            return { Profit: acc.Profit + Profit, Margin: acc.Margin + Margin };
        } else if (isObject(value)) {
            const { Profit, Margin } = getProfit(value, acc);

            return { Profit: acc.Profit + Profit, Margin: acc.Margin + Margin };
        } else {
            return acc;
        }
    }, initial);
}

export class BacktestBaseService extends BaseService {
    constructor(
        public store: Store<fromRoot.AppState>,
    ) {
        super();
    }

    protected getBacktestIOResponse(callbackId?: string): Observable<fromRes.BacktestIOResponse> {
        return this.store.pipe(
            select(fromRoot.selectBacktestIOResponse),
            this.filterTruth(),
            filter(res => !!res && (callbackId ? res.action === callbackId : true))
        );
    }

    getBacktestResult(): Observable<WorkerBacktest.WorkerResult> {
        return this.getBacktestIOResponse(BacktestOperateCallbackId.result).pipe(
            map(res => {
                const { Result } = <fromRes.ServerBacktestResult<string>>res.result;

                return !Result ? null : <fromRes.BacktestResult>JSON.parse(Result);
            }),
            this.filterTruth()
        );
    }

    getUIState(): Observable<UIState> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState)
        );
    }
}

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

    private createFileName(start: number, end: number): string {
        return moment(start).format('YYYYMMDDhhmmss').replace(/[\-\s:]/g, '') + '_' + moment(end).format('YYYYMMDDhhmmss').replace(/[\-\s:]/g, '') + '.csv';
    }

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

    private isTaskSuccessOrExist(code: number): boolean {
        return code === ServerBacktestCode.SUCCESS || code === ServerBacktestCode.ALREADY_EXIST;
    }

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
                        throw new TypeError(`The statistic result of ${statisticKey} is not a number.`);
                    }
                }),
                reduce((acc, cur) => acc + cur, 0)
            ))
        );
    }

    getBacktestProgress(): Observable<number> {
        return this.getUIState().pipe(
            map(state => state.isOptimizedBacktest),
            switchMap(isOptimize => isOptimize ? this.getOptimizedBacktestProgress() : this.getNormalBacktestProgress())
        );
    }

    private getNormalBacktestProgress(): Observable<number> {
        const middleStatus = this.store.pipe(
            select(fromRoot.selectBacktestState),
            map(state => state.GetTaskStatus),
            filter(state => !!state && !isNumber(state) && this.isTaskSuccessOrExist(state.Code)),
            map((status: fromRes.ServerBacktestResult<string>) => {
                const { Result } = status;

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

    private getOptimizedBacktestProgress(): Observable<number> {
        return this.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            map(state => state.backtestTasks.length || 1),
            withLatestFrom(this.store.pipe(
                select(fromRoot.selectBacktestResults),
                this.filterTruth(),
                map(results => results.length)
            ),
                (total, completed) => (completed / total)
            )
        );
    }

    private calTradeCount(data: fromRes.BacktestResult): number {
        const { TradeStatus, Snapshort, Snapshorts } = data;

        const accumulate = (acc: number, cur: number) => acc + cur;

        const cal = (status: fromRes.BacktestResultTradeStatus): number => Object.values(status || {}).reduce(accumulate, 0);

        const calShort = (shotArr: fromRes.BacktestResultSnapshot[]) => shotArr ? shotArr.map(item => cal(item.TradeStatus)).reduce(accumulate, 0) : 0;

        const calShorts = (shots: fromRes.BacktestSnapShots[]) => shots && shots.length > 0 ? calShort(shots[shots.length - 1][1]) : 0;

        return cal(TradeStatus) + calShort(Snapshort) + calShorts(Snapshorts);
    }

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

    getIndexOfBacktestingTask(): Observable<number> {
        return this.getUIState().pipe(
            map(state => state.backtestingTaskIndex),
            filter(idx => !!idx),
            startWith(0)
        );
    }

    getBacktestLogCols(): Observable<string[]> {
        return this.getUIState().pipe(
            filter(state => state.backtestTasks && !!state.backtestTasks.length),
            map(state => head(state.backtestTasks).map(item => item.variableDes))
        );
    }

    getBacktestLogRows(): Observable<number[][]> {
        return this.getUIState().pipe(
            filter(state => Array.isArray(state.backtestTasks)),
            map(state => state.backtestTasks.map(data => data.map(task => task.variableValue)))
        );
    }

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

    protected getSharpRatio(source: BacktestProfitDescription[]): Observable<number> {
        return this.getStandardDeviation(source).pipe(
            withLatestFrom(
                this.getAnnualizedReturns(source),
                (standardDeviation, annualizedReturns) => standardDeviation === 0 ? 0 : annualizedReturns / standardDeviation
            )
        );
    }

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

    private getDayProfit(source: BacktestProfitDescription[]): (end: number) => number {
        let i = 0;

        const len = source.length;

        return end => {
            let dayProfit = 0;

            for (; i < len && source[i].time < end; i++) {
                dayProfit = dayProfit + source[i].profit - (i > 0 ? source[i - 1].profit : 0);
            }

            return dayProfit;
        };
    }

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

    protected getYearDays(): Observable<number> {
        return this.getUIState().pipe(
            filter(state => !!state.platformOptions),
            mergeMap(state => {
                const ids = state.platformOptions.map(item => item.eid);

                const platforms = this.constant.BACKTEST_PLATFORMS_CONFIG.filter(item => ids.includes(item.eid));

                return from(platforms).pipe(
                    min((pre, cur) => pre.yearDays - cur.yearDays),
                    map(({ yearDays }) => yearDays)
                );
            })
        );
    }

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
                returns: this.unwrap(this.getAnnualizedReturns(profitLogs)),
            };
        };

        return this.getBacktestResults(code => code !== ServerBacktestCode.SUCCESS).pipe(
            map(results => results.map(result => !!result ? generateLogResult(result) : null))
        );
    }

    downloadLogs(): void {
        const colNames = zip(
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
                    result.profit.toFixed(5),
                ] : [index + 1, ...task, ...new Array(7).fill('-')]),
                reduce((acc: number[][], cur: number[]) => [...acc, cur], [])
            )),
            take(1)
        );

        this.exportFile(
            concat(colNames, data),
            this.getTimeRange().pipe(
                map(({ start, end }) => 'optimize_' + this.createFileName(start, end))
            )
        );
    }

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

    getBacktestAccountInfo(futuresDataFilter = (data: fromRes.BacktestResultSnapshot) => !!data.Symbols): Observable<BacktestAccount[]> {
        return this.getBacktestResult().pipe(
            map(data => {
                const { Exchanges } = data.Task;

                const { Snapshorts, Snapshort, Time } = data;

                const snapshotList = Snapshort ? <fromRes.BacktestSnapShots[]>[[Time, Snapshort]] : Snapshorts || [];

                const snapshots = lodashZip(...snapshotList.map(([time, shots]) => shots.map(item => ({ ...item, time } as fromRes.BacktestResultSnapshot))));

                return Exchanges.map((exchange, index) => {
                    const account = this.getAccountInitialInfo(exchange);

                    const source = snapshots[index];

                    return account.isFutures ? this.getFuturesAccount(account, source, futuresDataFilter) : this.getAccount(account, source);
                });
            })
        );
    }

    private getAccount(account: BacktestAccount, source: fromRes.BacktestResultSnapshot[]): BacktestAccount {
        const subSnapshots = source.filter(this.curry2Right(this.isValidSnapshot)(account));

        const snapshot = last(subSnapshots);

        const returns = snapshot ? this.calculateProfit(snapshot, account) : 0;

        const commission = snapshot ? snapshot.Commission : 0;

        const profitAndLose = subSnapshots.map(shot => ({ time: shot.time, profit: this.calculateProfit(shot, account) }));

        return { ...account, returns, commission, profitAndLose };
    }

    private calculateProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): number {
        return snapshot.Balance + snapshot.FrozenBalance - account.initialBalance + (snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks) * snapshot.Symbols[account.symbol].Last;
    }

    private getFuturesAccount(account: BacktestAccount, source: fromRes.BacktestResultSnapshot[], filterFn: (data: fromRes.BacktestResultSnapshot) => boolean): BacktestAccount {
        const subSnapshots = source.filter(filterFn);

        const snapshot = last(subSnapshots);

        const { Profit, Margin } = subSnapshots.reduce((acc, cur) => cur.Symbols ? getProfit(cur.Symbols, acc) : acc
            , { Profit: 0, Margin: 0 });

        const returns = snapshot ? this.calculateFuturesProfit(snapshot, account, Profit + Margin) : 0;

        const profitAndLose = subSnapshots.map(shot => {
            // tslint:disable-next-line:no-shadowed-variable
            const { Profit, Margin } = shot.Symbols ? getProfit(shot.Symbols, { Profit: 0, Margin: 0 }) : { Profit: 0, Margin: 0 };

            const profit = this.calculateFuturesProfit(shot, account, Profit + Margin);

            return { time: snapshot.time, profit };
        });

        return { ...account, positionProfit: Profit, currentMargin: Margin, commission: snapshot && snapshot.Commission || 0, returns, profitAndLose };
    }


    private calculateFuturesProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount, initial = 0): number {
        return account.isFuturesOkCoin ? initial + snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks :
            initial + snapshot.Balance + snapshot.FrozenBalance - account.initialBalance;
    }

    private isValidSnapshot(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): boolean {
        const { Symbols } = snapshot;

        return Symbols && <fromRes.BacktestResultSymbol>Symbols[account.symbol] && Symbols[account.symbol].Last;
    }

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
        };
    }

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
        const cols = this.translate.get(['TIME', 'PLATFORM', 'ORDER_ID', 'TYPE', 'PRICE', 'AMOUNT', 'INFORMATION']).pipe(
            map(res => [res.TIME, res.PLATFORM, res.ORDER_ID, res.TYPE, res.PRICE, res.AMOUNT, res.INFORMATION])
        );

        const data = this.getRunningLogs().pipe(
            map(logs => logs.map(log => {
                const { date, eid, orderId, logType, price, amount, extra } = log;

                const platform = new Eid2StringPipe(this.constant);

                const type = new LogTypePipe();

                const logPrice = new LogPricePipe(this.translate);

                const logExtra = new ExtraContentPipe();

                return [
                    date,
                    platform.transform(eid),
                    Number(orderId) > 0 ? orderId : '',
                    this.unwrap(this.translate.get(type.transform(logType))),
                    logPrice.transform(price, logType),
                    logType < 2 ? amount : '',
                    logExtra.transform(extra),
                ];
            })),
            take(1)
        );

        this.exportFile(
            concat(cols, data),
            this.getTimeRange().pipe(
                map(({ start, end }) => this.createFileName(start, end))
            )
        );
    }
}
