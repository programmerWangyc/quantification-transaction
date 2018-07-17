import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { cloneDeep, omit } from 'lodash';
import * as moment from 'moment';
import { combineLatest, from, Observable } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, mergeMap, take } from 'rxjs/operators';

import { VariableType } from '../../app.config';
import { BaseService } from '../../base/base.service';
import { VariableOverview } from '../../interfaces/app.interface';
import {
    BacktestAdvanceOptions,
    BacktestConstantOptions,
    BacktestExchange,
    BacktestIORequest,
    BacktestIOType,
    BacktestPlatformOptions,
    BacktestPutTaskOptions,
    BacktestPutTaskParams,
    PutTaskCode,
    PutTaskCodeArg,
} from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { AdvancedOption, UIState } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { BacktestLevel } from '../backtest.config';
import { BacktestCode, BacktestSelectedPair } from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';

@Injectable()
export class BacktestParamService extends BaseService {
    constructor(
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
    ) {
        super();
    }

    // =======================================================Data acquisition=======================================================

    /**
     * 获取当前的策略，数据来源于 strategy reducer。
     */
    protected getStrategyDetail(): Observable<fromRes.StrategyDetail> {
        return this.store.pipe(
            select(fromRoot.selectStrategyDetailResponse),
            filter(res => !!res),
            map(res => res.result.strategy)
        );
    }

    /**
     * 获取当前策略使用的编程语言
     */
    protected getSelectedLanguage(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectStrategyUIState),
            filter(res => !!res),
            map(state => state.selectedLanguage)
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
     * 获取运行的节点，python时可以选择。
     */
    getRunningNode(): Observable<number> {
        return this.getUIState().pipe(
            map(res => res.runningNode)
        );
    }

    /**
     * 获取回测任务，单个任务中包括策略的代码及策略所依赖的模板的代码，还包含此代码运行的参数及代码的ID。
     */
    private getToBeTestedTask(): Observable<BacktestCode[]> {
        return this.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            take(1),
            map(state => {
                const { backtestTasks, backtestCode } = state;

                /**
                 * 1、在没有设置参数调优的情况下，reducer中生成的 backtestTasks 将是空的，因此直接发送回测的代码。
                 * 2、如果用户设置了调优参数，则需要发送多个任务进行回测，需要将调优参数分解到每一个单独任务中，else 中的逻辑就是用来生成回测请求序列
                 */
                if (backtestTasks.length === 0) {
                    return [backtestCode];
                } else {
                    return backtestTasks.map(optimizeArgs => {
                        // 深拷贝 backtestCode, 不能让流中的数据相互影响，否则有可能最后一个值把前面的值覆盖。
                        const result = cloneDeep(backtestCode);

                        return result.map(item => {
                            let { name, args, id } = item;

                            args = args.map(arg => {
                                if (!arg.isOptimizing) {
                                    return arg;
                                } else {
                                    const target = optimizeArgs.find(item => item.variableName === arg.variableName);

                                    return target ? { ...arg, variableValue: target.variableValue } : arg;
                                }
                            });

                            return { name, args, id };
                        });
                    })
                }
            }),
            mergeMap(tasks => from(tasks)),
            delay(50)
        );
    }

    /**
     * 获取当前策略所依赖的模板ID。
     */
    private getSelectedTemplateIds(): Observable<number[]> {
        return this.store.select(fromRoot.selectStrategyUIState).pipe(
            map(res => res.selectedTemplates),
            this.filterTruth()
        );
    }

    /**
     * 获取用户选中的模板，模板数据源是strategy list 的响应和strategy detail 响应中的 templates字段
     * @param releaseCache - 是否释放输出流中的缓存值。
     */
    getSelectedTemplates(releaseCache = true): Observable<fromRes.TemplateSnapshot[]> {
        releaseCache && fromRoot.selectStrategyDetailResponse.release();

        return combineLatest(
            this.getSelectedTemplateIds(),
            this.store.pipe(
                select(fromRoot.selectBacktestTemplates),
                filter(this.isTruth)
            )
        ).pipe(
            map(([ids, templates]) => templates.filter(({ id }) => ids.includes(id)))
        );
    }

    /**
     * 是否在参数调优情况下进行回测；检查回测代码的所有参数的 isOptimizing 字段。
     */
    isOptimizeBacktest(): Observable<boolean> {
        return this.getUIState().pipe(
            filter(state => !!state.backtestCode),
            map(state => this.isOptimizing(state.backtestCode))
        );
    }

    // =======================================================Backtest IO parameters=======================================================

    /**
     * 获取回测接口 putTask 的参数。
     */
    protected getPutTaskParameters(): Observable<BacktestIORequest> {
        return combineLatest(
            this.getStrategyDetail(),
            this.getSelectedLanguage(),
            this.getRunningNode(),
            this.generatePutTaskParams()
        ).pipe(
            map(([{ is_owner }, language, node, task]) => ({
                nodeId: is_owner ? node : 0,
                language: is_owner ? language : language + 1000,
                io: JSON.stringify([BacktestIOType.putTask, this.constant.BACK_END_LANGUAGES[language], JSON.stringify(task)])
            })),
            distinctUntilChanged(this.compareAllValues())
        );
    }

    /**
     * 生成回测任务的配置，几乎包含回测页面上所有的内容（除了运行的节点外）；
     * 1、合并的3条流中，最有可能出问题的是生成code的流，它需要根据参数调优及参数过滤器生成每一个回测任务的code.
     */
    protected generatePutTaskParams(): Observable<BacktestPutTaskParams> {
        return combineLatest(
            this.generatePutTaskCode(),
            this.generatePutTaskExchange(),
            this.generatePutTaskOptions()
        ).pipe(
            map(([code, exchange, options]) => ({ Code: code, Exchanges: exchange, Options: options, Start: options.TimeBegin, End: options.TimeEnd })),
            distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current))
        );
    }

    /**
     * 生成回测时所需要的Code字段的值。
     */
    private generatePutTaskCode(): Observable<PutTaskCode[]> {
        const getValue = (overview: VariableOverview): string | boolean | number => {
            if (overview.variableTypeId === VariableType.SELECT_TYPE) {
                return this.constant.transformStringToList(<string>overview.originValue).findIndex(item => item === overview.variableValue);
            } else {
                return overview.variableValue;
            }
        }

        return combineLatest(
            this.getToBeTestedTask().pipe(
                map(codes => codes.map(code => {
                    const { name, id, args } = code;

                    const result: PutTaskCodeArg[] = args.map(arg => <PutTaskCodeArg>[this.constant.removeConditionInName(arg.variableName), getValue(arg), arg.variableTypeId]);

                    return { name, id, args: result };
                }))
            ),
            this.getSelectedTemplates(false),
            this.getStrategyDetail()
        ).pipe(
            map(([codes, templates, strategy]) => codes.map(code => {
                const { id, name, args } = code;

                const sourceKey = !!strategy.is_owner ? 'source' : 'id'; // 用户不能看代码时统一传id。

                const contentOrId = name === this.constant.MAIN_CODE_FLAG ? strategy[sourceKey] : templates.find(template => template.id === id)[sourceKey];

                return [contentOrId, args, name] as PutTaskCode;
            }))
        );
    }

    /**
     * 生成回测时所需的 Options 字段。
     */
    private generatePutTaskOptions(): Observable<BacktestPutTaskOptions> {
        return combineLatest(
            this.getUIState(),
            this.getUpdatePeriod()
        ).pipe(
            map(([{ advancedOptions, timeOptions, backtestLevel, backtestCode }, updatePeriod]) => {
                const isOptimizeBacktest = this.isOptimizing(backtestCode);

                const { log, profit, chart, delay } = advancedOptions;

                const { start, end, klinePeriodId } = timeOptions;

                const begin = <number>moment(start).unix();

                const finish = <number>moment(end).unix();

                return {
                    RetFlags: this.getRetFlags(isOptimizeBacktest, backtestLevel),
                    MaxRuntimeLogs: isOptimizeBacktest ? 0 : log,
                    MaxProfitLogs: profit,
                    MaxChartLogs: isOptimizeBacktest ? 0 : chart,
                    DataServer: 'https://www.fmz.com',
                    // CPP
                    TimeBegin: begin,
                    TimeEnd: finish,
                    SnapshortPeriod: this.generateSnapshotPeriod(begin, finish) * 1000,
                    Period: this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes * 60 * 1000,
                    NetDelay: Math.max(1, delay),
                    UpdatePeriod: updatePeriod,
                }
            })
        );
    }

    /**
     * 生成回测 Options 中的 RetFlags 的值。
     * @param isMultipleTask 是否多任务，即用户是否设置了有效的调优参数。
     * @param level 回测的级别，模拟 or 实盘。
     */
    private getRetFlags(isMultipleTask: boolean, level: number): number {
        if (isMultipleTask) {
            return this.constant.BT_PROFIT_LOGS | this.constant.BT_CLOSE_PROFIT_LOGS | this.constant.BT_ACCOUNTS;
        }

        let result = this.constant.getRetFlags();

        if (level === BacktestLevel.simulation) {
            return result | this.constant.BT_SYMBOLS | this.constant.BT_INDICATORS;
        } else {
            return result;
        }
    }

    /**
     * 生成回测 Options 中的 UpdatePeriod 的值。
     */
    private getUpdatePeriod(): Observable<number> {
        return this.getSelectedLanguage().pipe(
            map(language => language === 1 ? 5000 : 500)
        );
    }

    /**
     * 生成回测 Options 中的 SnapshotPeriod 字段的基础值。
     * @param start 回测开始时间
     * @param end 回测结束时间
     */
    private generateSnapshotPeriod(start: number, end: number): number {
        let daySeconds = 24 * 60 * 60;

        const range = end - start;

        if (range / daySeconds <= 2) { // 2 天之内
            return 60 * 5;
        } else if (range / daySeconds < 30) {  // 一个月之内
            return 60 * 60;
        } else {
            return daySeconds;
        }
    }

    /**
     * 生成回测时所需要的 Exchanges 字段的值。
     */
    private generatePutTaskExchange(): Observable<BacktestExchange[]> {
        return this.getUIState().pipe(
            filter(({ platformOptions, timeOptions }) => !!platformOptions && !!platformOptions.length && !!timeOptions.start && !!timeOptions.end),
            map(state => {
                const { timeOptions, floorKlinePeriod, advancedOptions, platformOptions, isFaultTolerantMode, backtestLevel } = state;

                const { klinePeriodId } = timeOptions;

                const advanceConfig = this.generateAdvanceOptionsForExchange(advancedOptions, isFaultTolerantMode, backtestLevel, floorKlinePeriod);

                return platformOptions.map(option => {
                    const { eid, stock, makerFee, takerFee } = option;

                    const constantConfig: BacktestConstantOptions = omit(this.constant.BACKTEST_PLATFORMS_CONFIG.find(item => item.eid === eid), ['eid', 'yearDays']) as BacktestConstantOptions;

                    return {
                        Id: eid,
                        BaseCurrency: this.generateBaseCurrency(stock),
                        FeeMaker: this.generateFee(makerFee),
                        FeeTaker: this.generateFee(takerFee),

                        // constant options
                        ...constantConfig,
                        DataSource: this.generateDataSource(option),

                        // advance options
                        ...advanceConfig,

                        // platform options
                        ...this.generatePlatformOptionsForExchange(option, klinePeriodId),
                    }
                })
            })
        );
    }

    /**
     *  生成回测字段 Exchange 中的高级选项的配置。
     */
    private generateAdvanceOptionsForExchange(option: AdvancedOption, isFaultTolerantMode: boolean, backtestLevel: number, floorKlinePeriod: number): BacktestAdvanceOptions {
        const { faultTolerant, slipPoint, delay, barLen } = option;

        return {
            FaultTolerant: isFaultTolerantMode ? faultTolerant : 0,
            SlipPoint: Math.max(0, slipPoint),
            NetDelay: Math.max(1, delay),
            MaxBarLen: Math.max(100, barLen),
            Mode: backtestLevel,
            BasePeriod: this.generateBasePeriod(backtestLevel, floorKlinePeriod),
        };
    }

    /**
     *  生成回测字段 Exchange 中的平台选项的配置。
     */
    private generatePlatformOptionsForExchange(platform: BacktestSelectedPair, klinePeriodId: number): BacktestPlatformOptions {
        const { eid, stock, makerFee, takerFee, balance, remainingCurrency, minFee } = platform;

        return {
            Name: eid,
            Label: eid,
            Balance: balance || 0,
            Stocks: remainingCurrency || 0,
            Fee: [makerFee, takerFee],
            MinFee: minFee || 0,
            Period: this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes,
            Currency: stock,
            QuoteCurrency: this.constant.BACKTEST_PLATFORMS.find(item => item.eid === eid).quoteCurrency,
        };
    }

    /**
     * 常量配置中的 DataSource 的值。
     */
    private generateDataSource(pair: BacktestSelectedPair): string {
        return this.constant.BACKTEST_PLATFORMS_CONFIG.find(item => item.eid === pair.eid).DataSource || pair.stock;
    }

    /**
     * 生成回测配置 Exchange 中的 FeeMaker, FeeTaker的值。
     */
    private generateFee(fee: number): number {
        return fee * 1000;
    }

    /**
     * 生成回测配置 Exchange 中BaseCurrency字段的值
     */
    private generateBaseCurrency(stock: string): string {
        return stock.split('_')[0];
    }

    /**
     * 生成回测配置 Exchange 中BasePeriod字段的值
     */
    private generateBasePeriod(backtestLevel: number, klinePeriodId: number): number {
        return backtestLevel === 1 ? 1000 : this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes * 60000;
    }

    protected isOptimizing(data: BacktestCode[]): boolean {
        return data.some(code => code.args.some(arg => arg.isOptimizing));
    }

}
