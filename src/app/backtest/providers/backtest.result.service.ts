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
import { BacktestAccount, BacktestLogResult } from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';


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

export function getProfit(data: Object, initial: fromRes.BacktestResultSymbolProfit): fromRes.BacktestResultSymbolProfit {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (key === 'Long' || key === 'Short') {
            const { Profit, Margin, CloseProfit } = <fromRes.BacktestResultSymbolProfit>value

            return { Profit: acc.Profit + Profit, Margin: acc.Margin + Margin, CloseProfit: acc.CloseProfit + CloseProfit };
        } else if (isObject(value)) {
            const { Profit, Margin, CloseProfit } = getProfit(value, acc);

            return { Profit: acc.Profit + Profit, Margin: acc.Margin + Margin, CloseProfit: acc.CloseProfit + CloseProfit };
        } else {
            return acc;
        }
    }, initial);
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
     * @description 获取回测接口的响应，如果传入回测的callbackId，则只会获取到指定的响应，否则将会获取到所有通过backtestIO接口接收到的响应。
     */
    protected getBacktestIOResponse(callbackId?: string): Observable<fromRes.BacktestIOResponse> {
        return this.store
            .pipe(
                select(fromRoot.selectBacktestIOResponse),
                filter(res => !!res && (callbackId ? res.action === callbackId : true))
            );
    }

    /**
     * @description custom operator, used to get backtest tasks in store;
     */
    private tasksOperator = () => <T>(source: Observable<T>): Observable<UIState> => {
        return source.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.backtestTasks && !!state.backtestTasks.length)
        );
    }

    /**
     * @deprecated 是否允许用户下载回测结果。只有当回测完成并且有结果供下载时才可以下载。
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
     * @description 下载日志。
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

    /** ============================================================调优状态下的日志信息================================================================== **/

    /**
     * @description 获取日志表格的列名称，参数列需要根据用户选择的调优参数动态生成；
     */
    getBacktestLogCols(): Observable<string[]> {
        return this.store.pipe(
            this.tasksOperator(),
            map(state => head(state.backtestTasks).map(item => item.variableDes))
        );
    }

    /**
     * @description 获取日志表格中的每一行。也就是根据调优参数生成的每一个进行测试的任务的参数组合。
     */
    getBacktestLogRows(): Observable<number[][]> {
        return this.store.pipe(
            this.tasksOperator(),
            map(state => state.backtestTasks.map(data => data.map(task => task.variableValue)))
        );
    }

    /**
     * @description 生成回测日志，数据来源于响应的Result字段， 如果发生错误，当前的回测结果为空。
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

                        const { Elapsed, Profit } = data;

                        return {
                            elapsed: Elapsed / this.constant.BACKTEST_RESULT_ELAPSED_RATE,
                            profit: Profit,
                            tradeCount: getTradeCount(data),
                            winningRate: this.unwrap(this.getWinningRate(data)),
                            maxDrawdown: this.unwrap(this.getMaxDrawdown(data)),
                            sharpeRatio: this.unwrap(this.getSharpRatio(data)),
                            returns: this.unwrap(this.getAnnualizedReturns(data))
                        }
                    }
                })
            })
        );
    }

    /**
     * @description 取出 Observable 中的结果;
     */
    private unwrap(obs: Observable<any>): number {
        let result = null;

        obs.subscribe(res => result = res);

        return result;
    }

    /**
     * @description 获取胜率；ProfitLogs 元素中后个收益大于前一个收益时，取胜结果加1，胜率 = 取胜结果 / 收益日志总数。
     */
    private getWinningRate(source: fromRes.BacktestResult): Observable<number> {
        const { ProfitLogs } = source;

        if (!ProfitLogs || ProfitLogs.length === 0) {
            return of(0);
        } else {
            return from(ProfitLogs.map(profit => profit[1])).pipe(
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

                    return wins / ProfitLogs.length;
                })
            )
        }
    }

    /**
     * @description 获取最大回撤值；
     */
    private getMaxDrawdown(source: fromRes.BacktestResult): Observable<number> {
        return this.getTotalAssets().pipe(
            take(1),
            map(totalAssets => {
                const { ProfitLogs } = source;

                return ProfitLogs.reduce((maxDrawdown, [time, profit]) => {
                    const assets = profit + totalAssets;

                    const drawDown = 1 - (profit + totalAssets) / assets;

                    if (assets > 0 && drawDown > maxDrawdown) {
                        return drawDown;
                    } else {
                        return maxDrawdown;
                    }
                }, 0)
            })
        );
    }

    /**
     * @description 获取总资产；优先使用余币的值。
     */
    private getTotalAssets(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.platformOptions && !!state.platformOptions.length),
            map(state => {
                const { platformOptions } = state;

                const balance = platformOptions.reduce((acc, cur) => acc + cur.balance, 0);

                const remainCurrency = platformOptions.reduce((acc, cur) => acc + cur.remainingCurrency, 0);

                return remainCurrency || balance;
            })
        );
    }

    /**
     * @description 计算回测任务的夏普比率
     * @link www.baike.baidu.com SharpeRatio = (E(Rp) - Rf) / oP  E(Rp): 投资组合预期报酬率 Rf:无风险利率；oP: 投资组合的标准差；
     */
    private getSharpRatio(source: fromRes.BacktestResult): Observable<number> {
        return this.getRatio(source).pipe(
            defaultIfEmpty([]),
            map(radios => {
                if (radios.length === 0 || radios.every(radio => radio === 0)) {
                    return 0;
                } else {
                    const total = radios.length;

                    const average = radios.reduce((acc, cur) => acc + cur) / total;

                    const variance = radios.reduce((acc, cur) => acc + Math.pow(cur - average, 2), 0) / average;

                    const standardDeviation = Math.sqrt(variance);

                    return standardDeviation;
                }
            }),
            withLatestFrom(
                this.getAnnualizedReturns(source),
                (standardDeviation, annualizedReturns) => standardDeviation === 0 ? 0 : annualizedReturns / standardDeviation
            )
        );
    }

    private getRatio(source: fromRes.BacktestResult): Observable<number[]> {
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
     * @description 获取回测的时间周期
     */
    private getTimeRange(): Observable<{ start: number; end: number }> {
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

    private getDayProfit(source: fromRes.BacktestResult, endTime: number): Observable<number> {
        return from(source.ProfitLogs).pipe(
            takeWhile(([time, _]) => time < endTime),
            map(([_, profit]) => profit),
            startWith(0),
            bufferCount(2, 1),
            reduce((acc: [number][], cur: [number, number]) => [...acc, cur], []),
            map(data => data.slice(0, -1).reduce((acc, cur: [number, number]) => acc + (cur[1] - cur[0]), 0))
        );
    }

    /**
     * @description 获取年化交易天数，使用回测交易平台中的最小值。
     */
    private getYearDays(): Observable<number> {
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
     * @description 获取年化预估收益
     * @param source
     */
    private getAnnualizedReturns(source: fromRes.BacktestResult): Observable<number> {
        const { ProfitLogs } = source;

        if (isEmpty(ProfitLogs)) {
            return of(0);
        }

        const [_, profit] = last(ProfitLogs);

        return zip(
            this.getYearDays(),
            this.getTimeRange(),
            this.getTotalAssets()
        ).pipe(
            map(([yearDays, { start, end }, totalAssets]) => (profit / totalAssets) * yearDays * this.PERIOD / (start - end))
        );
    }

    /** ============================================================非调优状态下的帐户信息================================================================== **/

    /**
     * @description 获取未调优状态下的回测结果。
     */
    getBacktestAccountInfo(): Observable<BacktestAccount[]> {
        return this.getBacktestIOResponse(BacktestOperateCallbackId.result)
            .pipe(
                map(res => {
                    const { Result } = <fromRes.ServerBacktestResult<string>>res.result;

                    const data = <fromRes.BacktestResult>JSON.parse(Result);

                    const { Exchanges } = data.Task;

                    const { Snapshorts } = data;

                    const snapshots = lodashZip(...Snapshorts.map(([time, snapshots]) => snapshots.map(item => ({ ...item, time } as fromRes.BacktestResultSnapshot))));

                    return Exchanges.map((exchange, index) => {
                        const account = this.getAccountInitialInfo(exchange);

                        const source = snapshots[index];

                        return account.isFutures ? this.getFuturesAccount(account, source) : this.getAccount(account, source);
                    })
                })
            );
    }

    /**
     *  @description 获取非期货的帐户信息；
     */
    private getAccount(account: BacktestAccount, source: fromRes.BacktestResultSnapshot[]): BacktestAccount {
        const subSnapshots = source.filter(this.curry2Right(this.isValidSnapshot)(account));

        const snapshot = last(subSnapshots);

        const returns = snapshot ? this.calculateProfit(snapshot, account) : 0;

        const commission = snapshot.Commission;

        return { ...account, returns, commission, };
    }

    /**
     * @description 计算收益值；
     */
    private calculateProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): number {
        return snapshot.Balance + snapshot.FrozenBalance - account.initialBalance + (snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks) * snapshot.Symbols[account.symbol].Last;
    }

    /**
     * @description 获取期货的帐户信息；
     */
    private getFuturesAccount(account: BacktestAccount, source: fromRes.BacktestResultSnapshot[]): BacktestAccount {
        const subSnapshots = source.filter(item => item.Symbols);

        const snapshot = last(subSnapshots);

        const { Profit, CloseProfit, Margin } = subSnapshots.reduce((acc, cur) => cur.Symbols ? getProfit(cur.Symbols, acc) : acc
            , { Profit: 0, Margin: 0, CloseProfit: 0 });

        const returns = snapshot ? this.calculateFuturesProfit(snapshot, account, Profit + Margin) : 0;

        return { ...account, positionProfit: Profit, currentMargin: Margin, commission: snapshot && snapshot.Commission || 0, closeProfit: CloseProfit, returns };
    }

    /**
     * @description 计算期货的收益值；
     */
    private calculateFuturesProfit(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount, initial = 0): number {
        return account.isFuturesOkCoin ? initial + snapshot.Stocks + snapshot.FrozenStocks - account.initialStocks :
            initial + snapshot.Balance + snapshot.FrozenBalance - account.initialBalance;
    }

    /**
     * @description 计算snapshot时的判定函数。
     */
    private isValidSnapshot(snapshot: fromRes.BacktestResultSnapshot, account: BacktestAccount): boolean {
        const { Symbols } = snapshot;

        return Symbols && <fromRes.BacktestResultSymbol>Symbols[account.symbol] && Symbols[account.symbol].Last;
    }

    /**
     * @description 生成帐户的初始信息。
     */
    private getAccountInitialInfo(source: fromRes.BacktestResultExchange): BacktestAccount {
        const { Id, BaseCurrency, QuoteCurrency, Balance, Stocks } = source;

        const isFutures = Id.includes('Futures_');

        const isFuturesOkCoin = Id.includes('Futures_OKCoin');

        return {
            baseCurrency: BaseCurrency,
            closeProfit: 0,
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