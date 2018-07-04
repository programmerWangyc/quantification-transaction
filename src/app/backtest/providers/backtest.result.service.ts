import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { head, isObject, last, range } from 'lodash';
import * as moment from 'moment';
import { from, zip } from 'rxjs';
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
import { BacktestResult, ServerBacktestResult } from '../../interfaces/response.interface';
import { UIState } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { ServerBacktestCode } from '../backtest.config';
import { BacktestLogResult } from '../backtest.interface';
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

@Injectable()
export class BacktestResultService extends BaseService {
    PERIOD = 24 * 60 * 60 * 1000;

    constructor(
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
    ) {
        super();
    }

    /**
     * @description custom operator, used to get backtest tasks in store;
     */
    tasksOperator = () => <T>(source: Observable<T>): Observable<UIState> => {
        return source.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.backtestTasks && !!state.backtestTasks.length)
        );
    }

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
                    const response = (<ServerBacktestResult<string>>result.result);
                    if (result.error || response.Code !== ServerBacktestCode.SUCCESS) {
                        return null;
                    } else {
                        const data = <BacktestResult>JSON.parse(response.Result);

                        const { Elapsed, Profit } = data;

                        return {
                            elapsed: Elapsed / this.constant.BACKTEST_RESULT_ELAPSED_RATE, // 耗时
                            profit: Profit, // 利润
                            tradeCount: getTradeCount(data), // 交易次数
                            winningRate: this.getWinningRate(data),
                            maxDrawdown: this.getMaxDrawdown(data),
                            sharpeRatio: this.getSharpRatio(data),
                        }
                    }
                })
            })
        )
    }

    /**
     * @description 获取胜率；ProfitLogs 元素中后个收益大于前一个收益时，取胜结果加1，胜率 = 取胜结果 / 收益日志总数。
     */
    private getWinningRate(source: BacktestResult): number {
        const { ProfitLogs } = source;
        if (!ProfitLogs || ProfitLogs.length === 0) {
            return 0;
        } else {
            let result = 0;

            from(ProfitLogs.map(profit => profit[1])).pipe(
                bufferCount(2, 1),
                reduce((acc: [number][], cur: [number, number]) => [...acc, cur], []),
                map(res => res.length > 1 ? res.reduce((acc, cur) => {
                    if (cur.length === 1) {
                        return acc;
                    } else {
                        return acc + (cur[1] > cur[0] ? 1 : 0);
                    }
                }, 1) : 1)
            )
                .subscribe(res => result = res / ProfitLogs.length);

            return result;
        }
    }

    /**
     * @description 获取最大回撤值；
     */
    private getMaxDrawdown(source: BacktestResult): number {
        let result = 0;

        this.getTotalAssets().pipe(
            take(1)
        )
            .subscribe(totalAssets => {
                const { ProfitLogs } = source;

                result = ProfitLogs.reduce((maxDrawdown, [time, profit]) => {
                    const assets = profit + totalAssets;

                    const drawDown = 1 - (profit + totalAssets) / assets;

                    if (assets > 0 && drawDown > maxDrawdown) {
                        return drawDown;
                    } else {
                        return maxDrawdown;
                    }
                }, 0)
            })

        return result;
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

    private getSharpRatio(source: BacktestResult): number {
        let result = NaN;

        this.getRatio(source).pipe(
            defaultIfEmpty([]),
            map(radios => {
                if (radios.length === 0) {
                    result = 0;
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
        )
            .subscribe(res => result = res);

        return result;
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

    private getDayProfit(source: BacktestResult, endTime: number): Observable<number> {
        return from(source.ProfitLogs).pipe(
            takeWhile(([time, _]) => time < endTime),
            map(([_, profit]) => profit),
            startWith(0),
            bufferCount(2, 1),
            reduce((acc: [number][], cur: [number, number]) => [...acc, cur], []),
            map(data => data.slice(0, -1).reduce((acc, cur: [number, number]) => acc + (cur[1] - cur[0]), 0))
        );
    }

    private getYearDays(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectBacktestUIState),
            filter(state => !!state.platformOptions && !!state.platformOptions.length),
            map(state => {
                const ids = state.platformOptions.map(item => item.eid);

                const platforms = this.constant.BACKTEST_PLATFORMS_CONFIG.filter(item => ids.includes(item.eid))

                let result = 0;

                from(platforms).pipe(
                    min((pre, cur) => pre.yearDays - cur.yearDays)
                )
                    .subscribe(({ yearDays }) => result = yearDays)

                return result;
            })
        )
    }

    private getRatio(source: BacktestResult): Observable<number[]> {
        return this.getTimeRange().pipe(
            mergeMap(({ start, end }) => from(range(start, end, this.PERIOD)).pipe(
                map(day => zip(
                    this.getDayProfit(source, day + this.PERIOD),
                    this.getTotalAssets().pipe(
                        take(1)
                    ),
                    this.getYearDays()
                ).pipe(
                    map(([profit, assets, yearDays]) => ((profit / assets) * yearDays) / this.PERIOD)
                )),
                reduce((acc: number[], cur: number) => [...acc, cur], [])
            )),
            take(1)
        );
    }

    private getAnnualizedReturns(source: BacktestResult): Observable<number> {
        const { ProfitLogs } = source;

        const [_, profit] = last(ProfitLogs);

        return zip(
            this.getYearDays(),
            this.getTimeRange(),
            this.getTotalAssets()
        ).pipe(
            map(([yearDays, { start, end }, totalAssets]) => (profit / totalAssets) * yearDays * this.PERIOD / (start - end))
        );
    }
}
