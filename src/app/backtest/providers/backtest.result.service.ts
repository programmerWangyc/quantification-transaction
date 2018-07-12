import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import * as fileSaver from 'file-saver';
import { head, isEmpty, isNull, isObject, last, range, zip as lodashZip } from 'lodash';
import * as moment from 'moment';
import { concat, from, of, zip } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import {
    bufferCount,
    defaultIfEmpty,
    filter,
    map,
    mergeMap,
    min,
    reduce,
    startWith,
    take,
    takeWhile,
    withLatestFrom,
} from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as fromRes from '../../interfaces/response.interface';
import { BacktestOperateCallbackId } from '../../store/backtest/backtest.action';
import { UIState } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { ServerBacktestCode } from '../backtest.config';
import {
    BacktestAccount,
    BacktestAssetsAndTime,
    BacktestLogResult,
    BacktestMaxDrawDownDescription,
    BacktestProfitDescription,
} from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';


/**
 * 获取交易次数，递归查找所有的 'TradeStatus' 字段，累积其sell， buy字段。
 * @param data 需要查找的对象
 * @returns 交易总次数
 */
export function getTradeCount(data: Object): number {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (key === 'TradeStatus') { // 定死的Key；
            const { sell = 0, buy = 0 } = value;

            return acc + sell + buy;
        } else if (isObject(value)) {
            return acc + getTradeCount(value);
        } else {
            return acc;
        }
    }, 0);
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

export interface MaxDrawdownResultFn {
    (maxDrawdown: number, [time, profit]: [number, number]): number;
}

@Injectable()
export class BacktestResultService extends BaseService {
    PERIOD = 24 * 60 * 60 * 1000;

    constructor(
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
        public translate: TranslateService,
    ) {
        super();
    }

    /**
     *  获取回测接口的响应，如果传入回测的callbackId，则只会获取到指定的响应，否则将会获取到所有通过backtestIO接口接收到的响应。
     */
    protected getBacktestIOResponse(callbackId?: string): Observable<fromRes.BacktestIOResponse> {
        return this.store
            .pipe(
                select(fromRoot.selectBacktestIOResponse),
                filter(res => !!res && (callbackId ? res.action === callbackId : true))
            );
    }

    /**
     *  custom operator, used to get backtest tasks in store;
     */
    private tasksOperator = () => <T>(source: Observable<T>): Observable<UIState> => {
        return source.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.backtestTasks && !!state.backtestTasks.length)
        );
    }

    /**
     * custom operator, used to get backtest result in store
     */

    protected backtestResult = () => (source: Observable<fromRes.BacktestIOResponse>): Observable<fromRes.BacktestResult> => {
        return source.pipe(
            map(res => {
                const { Result } = <fromRes.ServerBacktestResult<string>>res.result;

                if (!Result) {
                    return null;
                } else {
                    return <fromRes.BacktestResult>JSON.parse(Result);
                }
            })
        );
    }

    /**
     * 是否允许用户下载回测结果。只有当回测完成并且有结果供下载时才可以下载。
     */
    canSaveResult(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
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
     * 下载日志。
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

        concat(
            head,
            data
        ).pipe(
            reduce((acc, cur) => [acc, ...cur]),
            map(data => data.join('\n')),
            withLatestFrom(this.getTimeRange())
        ).subscribe(([data, { start, end }]) => {
            fileSaver.saveAs(
                new Blob([data], { type: 'text/csv;charset=utf8;' }),
                'optimize_' + moment(start).format('YYYYMMDDhhmmss').replace(/[\-\s:]/g, '') + "_" + moment(end).format('YYYYMMDDhhmmss').replace(/[\-\s:]/g, '') + ".csv"
            );
        });
    }

    // ============================================================调优状态下的日志信息==================================================================

    /**
     *  获取日志表格的列名称，参数列需要根据用户选择的调优参数动态生成；
     */
    getBacktestLogCols(): Observable<string[]> {
        return this.store.pipe(
            this.tasksOperator(),
            map(state => head(state.backtestTasks).map(item => item.variableDes))
        );
    }

    /**
     *  获取日志表格中的每一行。也就是根据调优参数生成的每一个进行测试的任务的参数组合。
     */
    getBacktestLogRows(): Observable<number[][]> {
        return this.store.pipe(
            this.tasksOperator(),
            map(state => state.backtestTasks.map(data => data.map(task => task.variableValue)))
        );
    }

    /**
     *  生成回测日志，数据来源于响应的Result字段， 如果发生错误，当前的回测结果为null。
     */
    getBacktestLogResults(): Observable<BacktestLogResult[]> {
        return this.store.pipe(
            select(fromRoot.selectBacktestResults),
            this.filterTruth(),
            map(results => {
                return results.map(result => {
                    const response = (<fromRes.ServerBacktestResult<string>>result.result);

                    if (result.error || response.Code !== ServerBacktestCode.SUCCESS) {
                        return null;
                    } else {
                        const data = <fromRes.BacktestResult>JSON.parse(response.Result);

                        const { Elapsed, Profit, ProfitLogs } = data;

                        const profitLogs = ProfitLogs.map(([time, profit]) => ({ time, profit }));

                        return {
                            elapsed: Elapsed / this.constant.BACKTEST_RESULT_ELAPSED_RATE,
                            profit: Profit,
                            tradeCount: getTradeCount(data),
                            winningRate: this.unwrap(this.getWinningRate(profitLogs)),
                            maxDrawdown: this.unwrap(this.getMaxDrawdown(profitLogs)).maxDrawdown,
                            sharpeRatio: this.unwrap(this.getSharpRatio(profitLogs)),
                            returns: this.unwrap(this.getAnnualizedReturns(profitLogs))
                        }
                    }
                })
            })
        );
    }

    /**
     *  取出 Observable 中的结果;
     */
    protected unwrap<T>(obs: Observable<T>): T {
        let result = null;

        obs.subscribe(res => result = res);

        return result;
    }

    /**
     *  获取胜率；ProfitLogs 元素中后个收益大于前一个收益时，取胜结果加1，胜率 = 取胜结果 / 收益日志总数。
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
            )
        }
    }

    /**
     *  获取最大回撤的信息集合；
     */
    protected getMaxDrawdown(source: BacktestProfitDescription[]): Observable<BacktestMaxDrawDownDescription> {
        return this.getTotalAssets().pipe(
            take(1),
            map(totalAssets => {
                const initial: BacktestMaxDrawDownDescription = { maxAssets: 0, startDrawdownTime: 0, maxDrawdown: 0, maxAssetsTime: 0, maxDrawdownTime: 0 };

                return source.reduce(({ startDrawdownTime, maxDrawdown, maxAssets, maxAssetsTime, maxDrawdownTime }, { time, profit }) => {
                    const currentAssets = profit + totalAssets;

                    if (currentAssets > maxAssets) {
                        maxAssets = currentAssets;

                        maxAssetsTime = time;
                    }

                    const drawDown = 1 - (profit + totalAssets) / maxAssets;

                    if (maxAssets > 0 && drawDown > maxDrawdown) {
                        return { startDrawdownTime: maxAssetsTime, maxDrawdown: drawDown, maxAssets, maxAssetsTime, maxDrawdownTime: 0 };
                    } else {
                        return { startDrawdownTime, maxDrawdown, maxAssets, maxAssetsTime, maxDrawdownTime: 0 };
                    }
                }, initial);
            })
        );
    }

    /**
     *  获取总资产；默认优先使用余币的值。
     */
    protected getTotalAssets(isBalancePrior = false): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
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
            mergeMap(({ start, end }) => from(range(start, end, this.PERIOD)).pipe(
                mergeMap(day => zip(
                    this.getDayProfit(source, day + this.PERIOD),
                    this.getTotalAssets().pipe(
                        take(1)
                    ),
                    this.getYearDays()
                ).pipe(
                    map(([profit, assets, yearDays]) => (profit / assets) * yearDays),
                )),
                reduce((acc: number[], cur: number) => [...acc, cur], [])
            )),
            take(1)
        );
    }

    /**
     *  获取回测的时间周期
     */
    protected getTimeRange(): Observable<{ start: number; end: number }> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.timeOptions),
            map(({ timeOptions }) => {
                const { start, end } = timeOptions;

                const begin = moment(start).unix() * 1000;

                const finish = moment(end).unix() * 1000;

                return { start: begin, end: (finish - begin) % this.PERIOD > 0 ? (finish / this.PERIOD + 1) * this.PERIOD : finish };
            })
        );
    }

    /**
     * 获取按天计算后的收益值
     * @param source 回测结果
     * @param endTime 结束时间
     */
    private getDayProfit(source: BacktestProfitDescription[], endTime: number): Observable<number> {
        return from(source).pipe(
            takeWhile(({ time }) => time < endTime),
            map(({ profit }) => profit),
            startWith(0),
            bufferCount(2, 1),
            reduce((acc: [number][], cur: [number, number]) => [...acc, cur], []),
            map(data => data.slice(0, -1).reduce((acc, cur: [number, number]) => acc + (cur[1] - cur[0]), 0))
        );
    }

    /**
     *  获取年化交易天数，使用回测交易平台中的最小值。
     */
    protected getYearDays(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.platformOptions && !!state.platformOptions.length),
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
     *  获取年化预估收益
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
            this.getTotalAssets()
        ).pipe(
            map(([yearDays, { start, end }, totalAssets]) => ({ yearDays, start, end, totalAssets }))
        );
    }



    // ============================================================非调优状态下的帐户信息==================================================================

    /**
     *  获取未调优状态下的回测结果。
     * @param futuresDataFilter: 期货的数据过滤器，用来在生成期货信息时过滤出有效的snapshot。
     */
    getBacktestAccountInfo(futuresDataFilter = (data: fromRes.BacktestResultSnapshot) => !!data.Symbols): Observable<BacktestAccount[]> {
        return this.getBacktestIOResponse(BacktestOperateCallbackId.result)
            .pipe(
                this.backtestResult(),
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
     *  获取非期货的帐户信息；
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
     *  计算收益值；
     */
    private calculateProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): number {
        return snapshot.Balance + snapshot.FrozenBalance - account.initialBalance + (snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks) * snapshot.Symbols[account.symbol].Last;
    }

    /**
     *  获取期货的帐户信息；
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
     *  计算期货的收益值；
     */
    private calculateFuturesProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount, initial = 0): number {
        return account.isFuturesOkCoin ? initial + snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks :
            initial + snapshot.Balance + snapshot.FrozenBalance - account.initialBalance;
    }

    /**
     *  计算snapshot时的判定函数。
     */
    private isValidSnapshot(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): boolean {
        const { Symbols } = snapshot;

        return Symbols && <fromRes.BacktestResultSymbol>Symbols[account.symbol] && Symbols[account.symbol].Last;
    }

    /**
     *  生成帐户的初始信息。
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

}
