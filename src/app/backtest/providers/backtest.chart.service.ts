import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { flatten, groupBy, isArray, isEmpty, last, omit, range } from 'lodash';
import * as moment from 'moment';
import { from, Observable, of, zip } from 'rxjs';
import { filter, map, mergeMap, reduce, take, withLatestFrom } from 'rxjs/operators';

import * as fromRes from '../../interfaces/response.interface';
import { ChartService } from '../../providers/chart.service';
import { UtilService } from '../../providers/util.service';
import * as fromRoot from '../../store/index.reducer';
import { BacktestRuntimeLogType } from '../backtest.config';
import {
    BacktestOrderLog,
    BacktestOrderLogs,
    BacktestProfitChartSubtitleConfig,
    BacktestProfitDescription,
    BacktestStrategyCharts,
} from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';
import { BacktestResultService } from './backtest.result.service';
import { BacktestSandboxService, SymbolRecord } from './backtest.sandbox.service';

export interface BacktestChart {
    title: string;
    option: Highcharts.Options;
}

interface BacktestChartSourceData {
    startDrawdownTime: number;
    maxAssetsTime: number;
    maxDrawdown: number;
    maxDrawdownTime: number;
    volatility: number;
    sharpRatio: number;
    annualizedReturns: number;
    totalReturns: number;
    yearDays: number;
}

@Injectable()
export class BacktestChartService extends BacktestResultService {
    protected fullscreenLabel: string;

    protected floatingProfitLoseLabel: string;

    protected accumulateProfitLabel: string;

    protected chartLabel: string;

    constructor(
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
        public translate: TranslateService,
        public sandbox: BacktestSandboxService,
        public chartService: ChartService,
        public util: UtilService
    ) {
        super(store, constant, translate, util);
        this.init();
    }

    init() {
        this.translate.get(['FULL_SCREEN', 'FLOATING_PROFIT_LOSE', 'ACCUMULATE_PROFIT', 'CHART']).subscribe(res => {
            this.fullscreenLabel = res.FULL_SCREEN;
            this.floatingProfitLoseLabel = res.FLOATING_PROFIT_LOSE;
            this.accumulateProfitLabel = res.ACCUMULATE_PROFIT;
            this.chartLabel = res.CHART;
        });
    }

    // ============================================================行情图表的数据处理==================================================================

    /**
     * 获取回测结果的行情数据，供生成图表使用；
     */
    getQuotaChartOptions(): Observable<BacktestChart[]> {
        return this.getBacktestResult().pipe(
            withLatestFrom(this.getTimeRange()),
            map(([res, { start }]) => {
                const { Symbols = [], RuntimeLogs = [], Indicators = {} } = res;

                const orderLogs = this.getOrderLogs(RuntimeLogs);

                return Symbols.map((item, index) => {
                    const [eid, stock, symbol, klinePeriod, records] = item;

                    const title = this.getProfitChartName(item);

                    const yAxis = this.generateYAxis(Indicators);

                    const partialSeries = this.generateQuotaChartSeries(item, orderLogs);

                    const recordArr = records.map(this.generateRecords);

                    const openHighLowClose = records.map(record => this.generateOpenHighLowClose(record));

                    const seriesTail1 = this.get_OBV_CMF_ATR_Series(Indicators, openHighLowClose, recordArr);

                    const seriesTail2 = this.get_BOLL_Alligator_MA_EMA_Series(Indicators, openHighLowClose, recordArr, klinePeriod);

                    const seriesTail3 = this.get_RSI_KDJ_MACD_Series(Indicators, openHighLowClose, recordArr);

                    const option = { ...this.getQuotaChartConfig(start, klinePeriod), yAxis, series: [...partialSeries, seriesTail1, ...seriesTail2, ...seriesTail3] } as Highstock.Options;

                    return { title, option };
                });
            })
        );
    }

    /**
     * 获取订单日志
     */
    private getOrderLogs(source: fromRes.RuntimeLog[]): BacktestOrderLogs {
        return source.reduce((acc, log) => {
            const result = this.getBacktestOrderLog(log);

            const key = this.generateOrderLogKey(log);

            if (!result) return acc;

            if (!acc[key]) {
                acc[key] = [result];
            } else {
                acc[key] = [...acc[key], result];
            }

            return acc;
        }, {}) as BacktestOrderLogs;
    }

    /**
     * 生成订单日志
     */
    private getBacktestOrderLog(data: fromRes.RuntimeLog): BacktestOrderLog {
        const [id, time, logType, eid, orderId, price, amount, extra, contractType, direction] = data;

        const result = { x: time, shape: 'flag' };

        if (eid === -1) return null;

        let labels = null;

        this.translate.get(['BUY', 'SALE', 'RETRACT', 'PRICE', 'SYMBOL', 'SYMBOL', 'MARKET_PRICE', 'ORDER_ID'])
            .subscribe(result => labels = result);

        const textTail = `${amount}<br/>${labels.PRICE}:${price < 0 ? labels.MARKET : price}<br/>${labels.ORDER_ID}:${orderId}<br/>${labels.SYMBOL}: ${contractType}`;

        switch (logType) {
            case BacktestRuntimeLogType.BUY:
                return { ...result, title: 'Buy', color: 'red', text: `${labels.BUY}:${textTail}` };

            case BacktestRuntimeLogType.SELL:
                return { ...result, title: 'Sell', color: 'green', text: `${labels.SALE}:${textTail}`, shape: 'circlepin' };

            case BacktestRuntimeLogType.CANCEL:
                return { ...result, title: 'Cancel', text: `${labels.RETRACT}:${orderId}<br/>${labels.SYMBOL}:${contractType}` };
            default:
                return null;
        }
    }

    /**
     * 生成行情图表tab页的名称;
     */
    private getProfitChartName(data: fromRes.BacktestSymbol): string {
        const [eid, stock, symbol, klinePeriod, records] = data;

        return `${eid}_${symbol}`.replace(`_${eid}`, '').replace('OKCoin_EN', 'OKCoin');
    }

    /**
     * 生成订单日志的Key值
     */
    private generateOrderLogKey(data: fromRes.BacktestSymbol | fromRes.RuntimeLog): string {
        if (data.length === 10) {
            const [id, time, logType, eid, orderId, price, amount, extra, contractType, direction] = data;

            return eid + '/' + contractType;
        } else {
            const [eid, stock, symbol, klinePeriod, records] = data;

            return eid + '/' + symbol;
        }
    }

    /**
     * 生成Y坐标
     */
    private generateYAxis(indicators: fromRes.BacktestResultIndicators): Highstock.YAxisOptions[] {
        const hasRIS = indicators.RIS;

        let min = hasRIS ? 0 : undefined;

        let max = hasRIS ? 100 : undefined;

        return [
            { opposite: false, height: '70%', lineWidth: 2, gridLineDashStyle: 'ShortDot', },
            { opposite: false, height: '10%', offset: 0, lineWidth: 2, top: '72%' },
            { opposite: false, title: { text: '' }, labels: { enabled: false }, top: '72%', height: '10%', offset: 0, lineWidth: 2, min, max },
            { opposite: false, title: { text: '', }, top: '84%', height: '16%', offset: 0, lineWidth: 2 }
        ];
    }

    /**
     * 生成volume值
     */
    private generateVolume(data: fromRes.BacktestSymbolRecords): { x: number; y: number; color: string } {
        const [time, open, high, low, close, volume] = data;

        return { x: time * 1000, y: volume, color: open > close ? '#ffa6a6' : '#a6d3a6' }
    }

    /**
     * 生成 open , high, low, close 的值
     */
    private generateOpenHighLowClose(data: fromRes.BacktestSymbolRecords): number[] {
        const [time, open, high, low, close, volume] = data;

        return [time * 1000, open, high, low, close];
    }

    /**
     * 生成 record 值，只有时间不一样。
     */
    private generateRecords(data: fromRes.BacktestSymbolRecords): SymbolRecord {
        const [time, open, high, low, close, volume] = data;

        return { time: time * 1000, open, high, low, close, volume };
    }

    /**
     * 根据symbol字段生成图表的 series。 生成的 series 是一个 混合类型，包含3种type：candlestick, flags, column。
     * 均在 Highstock 下的series 中有定义 ，但是接口文档中没有找到对应的字段，所以这里用了any;
     */
    private generateQuotaChartSeries(data: fromRes.BacktestSymbol, orderLogs: BacktestOrderLogs): any[] {
        const [eid, stock, symbol, klinePeriod, records] = data;

        const openHighLowCloseArr = records.map(this.generateOpenHighLowClose)

        const volumeArr = records.map(this.generateVolume);

        const key = this.generateOrderLogKey(data);

        const chartName = this.getProfitChartName(data);

        return [
            { type: 'candlestick', id: 'primary', name: chartName, data: openHighLowCloseArr, showInLegend: false, yAxis: 0 },
            { type: 'flags', name: 'Order', shape: 'circlepin', onSeries: 'primary', showInLegend: !!(orderLogs[key] && orderLogs[key].length > 0), data: orderLogs[key] || [] },
            { type: 'column', name: 'Volume', id: 'volume', color: '#a6d3a6', data: volumeArr, tooltip: { valueDecimals: 2 }, showInLegend: false, yAxis: 1 }
        ];
    }

    /**
     * 根据indicators生成图表的系列值
     * 检查OBV，CMF，ATR
     */
    private get_OBV_CMF_ATR_Series(indicators: fromRes.BacktestResultIndicators, openHighLowClose: number[][], records: SymbolRecord[]): Highcharts.SeriesOptions {
        const getBaseSeries = (decimals = 2) => ({ type: 'line', lineWidth: 1, linkedTo: 'volume', color: '#0000ff', showInLegend: true, tooltip: { valueDecimals: decimals }, yAxis: 2 });

        const getName = (prefix: string, period?: number) => period ? `${prefix}(${period})` : prefix

        if (indicators.OBV) {
            return { ...getBaseSeries(), name: getName('OBV'), data: this.sandbox.ArrToXY(openHighLowClose, this.sandbox.OBV(records)), };
        } else if (indicators.CMF) {
            const cmfPeriod = <number>indicators.CMF[0][0] || 20;

            return { ...getBaseSeries(4), name: getName('CMF', cmfPeriod), data: this.sandbox.ArrToXY(openHighLowClose, this.sandbox.CMF(records, cmfPeriod)), };
        } else {
            const atrPeriod = indicators.ATR && indicators.ATR[0][0] ? indicators.ATR[0][0] : 14;

            return { ...getBaseSeries(), color: '#008000', name: getName('ATR', atrPeriod), data: this.sandbox.ArrToXY(openHighLowClose, this.sandbox.ATR(records, atrPeriod)), };
        }
    }

    /**
     * 根据indicators生成图表的系列值
     * 检查BOLL，Alligator，MA，EMA；
     */
    private get_BOLL_Alligator_MA_EMA_Series(indicators: fromRes.BacktestResultIndicators, openHighLowClose: number[][], records: SymbolRecord[], klinePeriod: number): Highcharts.SeriesOptions[] {
        const seriesColor = ['blue', 'red', 'green'];

        const getBaseSeries = (decimals = 2): Highcharts.SeriesOptions => {
            return { lineWidth: 1, linkedTo: 'primary', showInLegend: true, type: 'line', tooltip: { valueDecimals: decimals } };
        }

        const getName = (prefix: string, periods: number[], tail?: string): string => tail ? `${prefix}(${periods.join(',')}) - ${tail}` : `${prefix}(${periods.join(',')})`;

        if (indicators.BOLL) {
            const periods = this.combine(indicators.BOLL[0], [20, 2]);

            const dataArr = this.sandbox.ArrToXY(openHighLowClose, this.sandbox.BOLL(records, periods[0], periods[1]));

            const seriesNames = [getName('BOLL', periods, 'Upper'), 'Middle', 'Lower'];

            return range(3).map(index => ({ ...getBaseSeries(), yAxis: 0, name: seriesNames[index], color: seriesColor[index], data: dataArr[index] }));
        } else if (indicators.Alligator) {
            const periods = this.combine(indicators.Alligator[0], [13, 8, 5]);

            const dataArr = this.sandbox.ArrToXY(openHighLowClose, this.sandbox.Alligator(records, periods[0], periods[1]), klinePeriod);

            const seriesNames = [getName('Alligator', periods, 'Jaw'), 'Teeth', 'Lips'];

            return range(3).map(index => ({ ...getBaseSeries(), yAxis: 0, name: seriesNames[index], color: seriesColor[index], data: dataArr[index] }));

        } else {
            const periods = indicators.MA || indicators.EMA || [[7], [30]];

            const maMethod = indicators.MA ? 'MA' : 'EMA';

            const lineColors = ['#f7a35c', '#7cb5ec', 'black'];

            return periods.map((period, index) => ({
                ...getBaseSeries(3),
                name: getName(maMethod, [period[0]]),
                data: this.sandbox.ArrToXY(openHighLowClose, this.sandbox[maMethod](records, period[0])),
                color: lineColors[index] || '',
            }))
        }
    }

    /**
     * 根据indicators生成图表的系列值
     * 检查RSI，KDJ，MACD，EMA；
     */
    private get_RSI_KDJ_MACD_Series(indicators: fromRes.BacktestResultIndicators, openHighLowClose: number[][], records: SymbolRecord[]): Highcharts.SeriesOptions[] {

        const getBaseSeries = (color: number): Highcharts.SeriesOptions => {
            const seriesColors = ['#f7a35c', '#7cb5ec', '#666'];

            return { lineWidth: 1, linkedTo: 'primary', yAxis: 3, showInLegend: false, type: 'line', tooltip: { valueDecimals: 2 }, color: seriesColors[color] };
        }

        const getName = (prefix: string, periods: number[], tail?: string): string => tail ? `${prefix}(${periods.join(',')}) - ${tail}` : `${prefix}(${periods.join(',')})`;

        if (indicators.RSI) {
            const periods = this.combine(indicators.RSI[0], [14]);

            const name = getName('RSI', periods);

            const data = this.sandbox.ArrToXY(openHighLowClose, this.sandbox.RSI(records, periods[0]));

            return [{ ...getBaseSeries(0), data, name, }];
        } else if (indicators.KDJ) {
            const periods = this.combine(indicators.KDJ[0], [9, 3, 3]);

            const seriesNames = 'KDJ'.split('').map(letter => getName(letter, periods));

            const data = this.sandbox.ArrToXY(openHighLowClose, this.sandbox.KDJ(records, periods[0], periods[1], periods[2]));

            return range(3).map(index => ({ ...getBaseSeries(index), name: seriesNames[index], data: data[index], }));
        } else {
            const periods = this.combine(indicators.MACD ? indicators.MACD[0] : [], [12, 26, 9]);

            const seriesNames = [getName('MACD', periods), 'Signal line', 'Histogram'];

            const result = this.sandbox.ArrToXY(openHighLowClose, this.sandbox.MACD(records, periods[0], periods[1], periods[2]));

            const data = result.map((item, index) => {
                if (index !== 2) { // corresponding to seriesNames; condition: not 'Histogram';
                    return item;
                } else {
                    return item.map(ele => ({ x: ele[0], y: ele[1], color: ele[1] < 0 ? '#ffa6a6' : '#a6d3a6' }))
                }
            });

            return range(3).map(index => {
                const result = { ...getBaseSeries(index), name: seriesNames[index], data: data[index], };

                return index !== 2 ? result : { ...result, type: 'column' };
            });
        }
    }

    /**
     * 合并两个数组的值，返回合并后的数组。合并的数组长度与参数中较长的数组相同。合并时如果源数组上有值时使用源数组的数据，否则使用默认值。
     * @param source 源数据；
     * @param defaultValue 默认值
     * @returns 合并后的数组
     */
    private combine(source: any[], defaultValue: any[]): any[] {
        if (source === undefined) return defaultValue;

        if (defaultValue === undefined) throw new Error('This function needs a defaultValue.');

        const length = Math.max(source.length, defaultValue.length);

        const result = [];

        for (let i = 0; i < length; i++) {
            result[i] = source[i] !== undefined ? source[i] : defaultValue[i];
        }

        return result;
    }

    // ========================================Backtest chart section===============================================================================

    /**
     * Get backtest profit log options;
     */
    private getQuotaChartConfig(startTime: number, period: number): any {
        return {
            // 此属性在官方配置中没有
            lang: {
                _fullscreen: this.fullscreenLabel,
            },
            legend: {
                enabled: true,
            },
            plotOptions: {
                series: {
                    turboThreshold: 0
                },
                candlestick: {
                    color: '#d75442',
                    upColor: '#6ba583'
                }
            },
            tooltip: {
                // 日期时间格式化
                xDateFormat: '%Y-%m-%d %H:%M:%S',
                color: '#f0f',
                changeDecimals: 4,
                borderColor: '#058dc7',
                crosshairs: true,
                shared: true,
                snap: 1,
            },
            rangeSelector: {
                buttons: this.chartService.typeButtons,
                selected: this.getBacktestRangeSelected(period),
                inputEnabled: false
            },
            xAxis: {
                plotLines: [{ //一条竖线
                    color: '#FF0000',
                    width: 2,
                    dashStyle: 'Dot',
                    value: moment(startTime).unix() * 1000,
                }],
            },
            // exporting: {
            //     buttons: {
            //         hideButton: {
            //             _titleKey: "_fullscreen",
            //             text: fullscreenLabel,
            //             onclick: function() {
            //                 util.toggleFullScreen(document.getElementById(eleId));
            //             }
            //         },
            //     }
            // }
        };
    }

    /**
     * Map kline period to range select button id.
     * @param period kline period
     */
    private getBacktestRangeSelected(period: number): number {
        if (period === 0) {
            return 0; // 1小时
        } else if (period > 0 && period < 3) {
            return 1; // 3 小时
        } else if (period === 3) {
            return 2  // 8小时
        } else if (period > 3) {
            return 3; // all
        }
    }

    // ============================================================浮动盈亏的数据处理==================================================================

    /**
     * 获取收益类图表的 highcharts 配置信息
     */
    getProfitChartConfig(series: any[], subtitle: string): any {
        return {
            subtitle: {
                text: subtitle
            },
            plotOptions: {
                series: {
                    turboThreshold: 0
                }
            },
            rangeSelector: {
                buttons: this.chartService.typeButtons,
                selected: 3,
                inputEnabled: false
            },
            xAxis: {
                type: 'datetime'
            },
            series,
            // 此属性在官方配置中没有
            lang: {
                _fullscreen: this.fullscreenLabel,
            },
            // exporting: {
            //     buttons: {
            //         hideButton: {
            //             _titleKey: "_fullscreen",
            //             text: $translate.instant("ui.g.fullscreen"),
            //             onclick: function () {
            //                 toggleFullScreen(this.renderTo);
            //             }
            //         },
            //     }
            // }
        }
    }

    /**
     * Whether need to display floating profit and lose chart for user;
     */
    hasFloatPLChart(): Observable<boolean> {
        return this.getBacktestAccountInfo().pipe(
            map(accounts => accounts.some(account => account.profitAndLose && !isEmpty(account.profitAndLose)))
        );
    }

    /**
     * 获取浮云盈亏图表的配置信息
     */
    getFloatPLChartOptions(): Observable<BacktestChart[]> {
        return this.getBacktestAccountInfo(_ => true).pipe(
            mergeMap(accounts => from(accounts).pipe(
                mergeMap(account => {
                    const { name, baseCurrency, quoteCurrency, profitAndLose, initialBalance, initialStocks } = account;

                    const initialNetWorth = initialBalance || initialStocks;

                    return zip(
                        of([name, baseCurrency, quoteCurrency].join('_')),
                        this.generateChartOptions(profitAndLose, initialNetWorth)
                    ).pipe(
                        map(([title, option]) => ({ title, option }))
                    );
                }),
                reduce((acc: BacktestChart[], cur: BacktestChart) => [...acc, cur], [])
            ))
        );
    }

    /**
     * Generate config data for every tab, includes tab's title and options for for highcharts;
     * @param data Profit source data;
     * @param initialNetWorth total assets;
     * @param title Tab title
     */
    private generateChartOptions(profit: BacktestProfitDescription[], initialNetWorth: number, winningRate?: number): Observable<Highstock.Options> {
        return this.getChartOptionSource(profit).pipe(
            take(1),
            map(source => {
                const series = this.generateSeries(profit, source);

                const subtitle = this.generateSubtitle(initialNetWorth, source, winningRate);

                return this.getProfitChartConfig(series, subtitle);
            })
        );
    }

    /**
     * Generate subtitle for chart option;
     * @returns Subtitle text.
     */
    private generateSubtitle(totalAssets: number, source: BacktestChartSourceData, winningRate: number): string {
        const { totalReturns, yearDays, annualizedReturns, volatility, sharpRatio, maxDrawdown } = source;

        const config: BacktestProfitChartSubtitleConfig = {
            initialNetWorth: totalAssets,
            totalReturns: (totalReturns * 100).toFixed(3) + '%',
            yearDays,
            annualizedReturns: (annualizedReturns * 100).toFixed(3) + '%',
            volatility: volatility === 0 ? '--' : volatility.toFixed(3) + '%',
            sharpRatio: volatility === 0 ? '--' : sharpRatio.toFixed(3),
            maxDrawdown: (maxDrawdown * 100).toFixed(3) + '%',
            totalAssets,
        };

        if (winningRate === undefined) {
            return this.unwrap(this.translate.get('FLOATING_PROFIT_SUBTITLE', config));
        } else {
            return this.unwrap(this.translate.get('PROFIT_SUBTITLE', { ...config, winningRate: (winningRate * 100).toFixed(3) + '%' }));
        }
    }

    /**
     * Generate chart config information;
     */
    private getChartOptionSource(profit: BacktestProfitDescription[]): Observable<BacktestChartSourceData> {
        return zip(
            this.getMaxDrawdown(profit, true),
            this.getStandardDeviation(profit),
            this.getSharpRatio(profit),
            this.getAnnualizedReturns(profit),
            this.getTotalReturns(profit),
            this.getYearDays()
        ).pipe(
            map(([maxDrawdownInfo, volatility, sharpRatio, annualizedReturns, totalReturns, yearDays]) => {
                const { startDrawdownTime, maxAssetsTime, maxDrawdown, maxDrawdownTime } = maxDrawdownInfo;

                return { startDrawdownTime, maxAssetsTime, maxDrawdown, maxDrawdownTime, volatility, sharpRatio, annualizedReturns, totalReturns, yearDays };
            })
        );
    }

    /**
     * Generate floating profit and lose chart series;
     */
    private generateSeries(profitAndLose: BacktestProfitDescription[], info: BacktestChartSourceData): any {
        const { startDrawdownTime, maxDrawdownTime } = info;

        let obj1 = {
            name: this.floatingProfitLoseLabel,
            data: profitAndLose.map(({ time, profit }) => [time, profit]),
            id: 'primary',
            tooltip: { valueDecimals: 8, xDateFormat: '%Y-%m-%d %H:%M:%S' },
            yAxis: 0,
        }

        const obj2 = { zoneAxis: 'x', zones: [{ value: startDrawdownTime, dashStyle: 'solid' }, { value: maxDrawdownTime, dashStyle: 'shortdash' }] };

        const head = maxDrawdownTime > startDrawdownTime ? Object.assign({}, obj1, obj2) : obj1;

        const data = this.generateFlagTypeSeriesData(profitAndLose, info);

        const tail = { name: this.unwrap(this.translate.get('EVENT')), type: 'flags', shape: 'circlepin', onSeries: 'primary', data };

        return data.length > 0 ? [head, tail] : [head];
    }

    /**
     * 获取类型为 flag 的系列的源数据；
     */
    private generateFlagTypeSeriesData(profit: BacktestProfitDescription[], info: BacktestChartSourceData): any {
        const { maxAssetsTime, maxDrawdownTime, maxDrawdown } = info;

        return profit.map(({ time, profit }) => {
            if (maxAssetsTime === time) {
                return { x: time, y: profit, title: 'High', shape: 'flag', text: this.unwrap(this.translate.get('MAX_PROFIT', { profit: profit.toFixed(8) })) }
            } else if (maxDrawdownTime === time) {
                return { x: time, y: profit, title: 'Low', shape: 'squarepin', text: this.unwrap(this.translate.get('MAX_DRAWDOWN_PROFIT', { maxDrawDown: (maxDrawdown * 100).toFixed(3) + '%', profit: profit.toFixed(8) })), color: 'red' }
            } else {
                return null;
            }
        }).filter(this.isTruth);
    }

    /**
     * Get total returns;
     * @param source Backtest result;
     */
    private getTotalReturns(source: BacktestProfitDescription[]): Observable<number> {
        if (isEmpty(source)) return of(0);

        const { profit } = last(source);

        //TODO: 这里可能有BUG，总资产是从父类的方法上拿来的，可能需要实现子类自己的 getTotalAssets 方法。
        return this.getTotalAssets(true).pipe(
            map(assets => profit / assets)
        );
    }

    // ============================================================收益曲线的数据处理==================================================================

    /**
     * 获取收益曲线的highcharts配置。
     */
    getProfitCurveOptions(): Observable<Highstock.Options> {
        return this.getBacktestResult().pipe(
            map(({ ProfitLogs }) => ProfitLogs),
            filter(logs => !!logs),
            withLatestFrom(this.getTotalAssets(true)),
            mergeMap(([profitLogs, totalAssets]) => {
                const profit = profitLogs.map(([time, profit]) => ({ time, profit }));

                return this.getWinningRate(profit).pipe(
                    mergeMap(winningRate => this.generateChartOptions(profit, totalAssets, winningRate))
                );
            }),
            take(1)
        );
    }

    // ============================================================策略图表的数据处理==================================================================

    /**
     * 获取策略图表的原始数据
     */
    private getStrategyChartSource(): Observable<BacktestStrategyCharts> {
        return this.getBacktestResult().pipe(
            filter(({ Chart }) => !!Chart && !!Chart.Cfg),
            map(({ Chart }) => {
                try {
                    const res = JSON.parse(Chart.Cfg.replace(/useHTML/gi, '__disableHTML'));

                    return { charts: isArray(res) ? res : [res], data: Chart.Datas };
                } catch (e) {
                    return null;
                }
            })
        );
    }

    /**
     * Whether show strategy chart;
     */
    hasStrategyCharts(): Observable<boolean> {
        return this.getStrategyChartSource().pipe(
            map(res => !!res)
        );
    }

    /**
     * Strategy chart configurations;
     */
    getStrategyChartOptions(): Observable<BacktestChart[]> {
        return this.getStrategyChartSource().pipe(
            map(({ charts, data }) => {
                const source = Object.entries(groupBy(data, ([idx]) => idx)).map(([key, value]) => ({
                    id: Number(key),
                    value: value.map(item => last(item))
                }));

                const optimizedSeries = flatten(charts.map((chart, index) => {
                    const { series } = chart;

                    return series && !!series.length ? series.map(series => ({ ...series, chartIndex: index })) : [];
                })).map((series, index) => {
                    const data = source.find(item => item.id === index);

                    return data ? { ...series, data: [...series.data, ...data.value.filter(item => !!item)] } : series;
                });

                return charts.map((chart, index) => {
                    const option = {
                        ...chart,
                        ...this.getStrategyChartConfig(),
                        series: optimizedSeries.filter(item => item.chartIndex === index).reduce((acc, cur) => [...acc, omit(cur, 'chartIndex')], [])
                    };

                    try {
                        return { title: chart.title.text, option };
                    } catch (e) {
                        return { title: this.chartLabel + '-' + index, option };
                    }
                });
            })
        );
    }

    private getStrategyChartConfig(): Object {
        return {
            // 此属性在官方配置中没有
            lang: {
                _fullscreen: this.fullscreenLabel,
            },
            // exporting: {
            //     buttons: {
            //         hideButton: {
            //             _titleKey: "_fullscreen",
            //             text: fullscreenLabel,
            //             onclick: function() {
            //                 util.toggleFullScreen(document.getElementById(eleId));
            //             }
            //         },
            //     }
            // }
        }
    }
}
