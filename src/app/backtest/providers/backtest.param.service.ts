import { select, Store } from '@ngrx/store';

import { cloneDeep, omit } from 'lodash';
import * as moment from 'moment';
import { combineLatest, from, Observable } from 'rxjs';
import { delay as observableDelay, distinctUntilChanged, filter, map, mergeMap, take } from 'rxjs/operators';

import { VariableType } from '../../app.config';
import { VariableOverview } from '../../interfaces/app.interface';
import {
    BacktestAdvanceOptions, BacktestConstantOptions, BacktestExchange, BacktestIORequest, BacktestIOType,
    BacktestPlatformOptions, BacktestPutTaskOptions, BacktestPutTaskParams, PutTaskCode, PutTaskCodeArg
} from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { AdvancedOption } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { UIState } from '../../store/strategy/strategy.reducer';
import { Language } from '../../strategy/strategy.config';
import { BacktestLevel } from '../backtest.config';
import { BacktestCode, BacktestSelectedPair } from '../backtest.interface';
import { BacktestConstantService } from './backtest.constant.service';
import { BacktestBaseService } from './backtest.result.service';

export class BacktestParamService extends BacktestBaseService {
    constructor(
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
    ) {
        super(store);
    }

    protected getStrategyDetailResponse(): Observable<fromRes.GetStrategyDetailResponse> {
        return this.store.pipe(
            select(fromRoot.selectStrategyDetailResponse),
        );
    }

    protected getStrategyDetail(): Observable<fromRes.StrategyDetail> {
        return this.getStrategyDetailResponse().pipe(
            filter(res => !!res),
            map(res => res.result.strategy)
        );
    }

    protected getStrategyUIState(): Observable<UIState> {
        return this.store.pipe(
            select(fromRoot.selectStrategyUIState),
            this.filterTruth()
        );
    }

    protected getSelectedLanguage(): Observable<number> {
        return this.getStrategyUIState().pipe(
            map(state => state.selectedLanguage)
        );
    }

    protected getCodeSnapshot(): Observable<string> {
        return this.getStrategyUIState().pipe(
            map(state => state.codeSnapshot)
        );
    }

    private getSelectedTemplateIds(): Observable<number[]> {
        return this.getStrategyUIState().pipe(
            map(state => state.selectedTemplates || []),
        );
    }

    getRunningNode(): Observable<number> {
        return this.getUIState().pipe(
            map(res => res.runningNode)
        );
    }

    private getToBeTestedTask(): Observable<BacktestCode[]> {
        return this.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            take(1),
            map(state => {
                const { backtestTasks, backtestCode } = state;

                if (backtestTasks.length === 0) {
                    return [backtestCode];
                } else {
                    return backtestTasks.map(optimizeArgs => {
                        const result = cloneDeep(backtestCode);

                        return result.map(item => {
                            let { args } = item;

                            const { name, id } = item;

                            args = args.map(arg => {
                                if (!arg.isOptimizing) {
                                    return arg;
                                } else {
                                    const target = optimizeArgs.find(optArg => optArg.variableName === arg.variableName);

                                    return target ? { ...arg, variableValue: target.variableValue } : arg;
                                }
                            });

                            return { name, args, id };
                        });
                    });
                }
            }),
            mergeMap(tasks => from(tasks)),
            observableDelay(50)
        );
    }

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

    isOptimizeBacktest(): Observable<boolean> {
        return this.getUIState().pipe(
            map(state => state.isOptimizedBacktest)
        );
    }

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
                io: JSON.stringify([BacktestIOType.putTask, this.constant.BACK_END_LANGUAGES[language], JSON.stringify(task)]),
            })),
            distinctUntilChanged(this.compareAllValues())
        );
    }

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

    private generatePutTaskCode(): Observable<PutTaskCode[]> {
        const getValue = (overview: VariableOverview): string | boolean | number => {
            if (overview.variableTypeId === VariableType.SELECT_TYPE) {
                return this.constant.transformStringToList(<string>overview.originValue).findIndex(item => item === overview.variableValue);
            } else {
                return overview.variableValue;
            }
        };

        return combineLatest(
            this.getToBeTestedTask().pipe(
                map(codes => codes.map(code => {
                    const { name, id, args } = code;

                    const result: PutTaskCodeArg[] = args.map(arg => <PutTaskCodeArg>[this.constant.removeConditionInName(arg.variableName), getValue(arg), arg.variableTypeId]);

                    return { name, id, args: result };
                }))
            ),
            this.getSelectedTemplates(false),
            this.getStrategyDetailResponse(),
            this.getStrategyUIState()
        ).pipe(
            map(([codes, templates, strategyRes, strategyUIState]) => codes.map(code => {
                const { id, name, args } = code;

                let contentOrId: string | number = null;

                if (!!strategyRes) {
                    const strategy = strategyRes.result.strategy;

                    const sourceKey = strategy.is_owner ? 'source' : 'id';

                    contentOrId = name === this.constant.MAIN_CODE_FLAG ? strategy[sourceKey] : templates.find(template => template.id === id)[sourceKey];
                } else {
                    contentOrId = strategyUIState.codeSnapshot;
                }

                return [contentOrId, args, name] as PutTaskCode;
            }))
        );
    }

    private generatePutTaskOptions(): Observable<BacktestPutTaskOptions> {
        return combineLatest(
            this.getUIState(),
            this.getUpdatePeriod()
        ).pipe(
            map(([{ advancedOptions, timeOptions, backtestLevel, isOptimizedBacktest }, updatePeriod]) => {
                const { log, profit, chart, delay } = advancedOptions;

                const { start, end, klinePeriodId } = timeOptions;

                const begin = <number>moment(start).unix();

                const finish = <number>moment(end).unix();

                return {
                    RetFlags: this.getRetFlags(isOptimizedBacktest, backtestLevel),
                    MaxRuntimeLogs: isOptimizedBacktest ? 0 : log,
                    MaxProfitLogs: profit,
                    MaxChartLogs: isOptimizedBacktest ? 0 : chart,
                    DataServer: 'https://www.fmz.com',
                    // CPP
                    TimeBegin: begin,
                    TimeEnd: finish,
                    SnapshortPeriod: this.generateSnapshotPeriod(begin, finish) * 1000,
                    Period: this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes * 60 * 1000,
                    NetDelay: Math.max(1, delay),
                    UpdatePeriod: updatePeriod,
                };
            })
        );
    }

    private getRetFlags(isMultipleTask: boolean, level: number): number {
        if (isMultipleTask) {
            return this.constant.BT_PROFIT_LOGS | this.constant.BT_CLOSE_PROFIT_LOGS | this.constant.BT_ACCOUNTS;
        }

        const result = this.constant.getRetFlags();

        if (level === BacktestLevel.simulation) {
            return result | this.constant.BT_SYMBOLS | this.constant.BT_INDICATORS;
        } else {
            return result;
        }
    }

    private getUpdatePeriod(): Observable<number> {
        return this.getSelectedLanguage().pipe(
            map(language => language === Language.Python ? 5000 : 500)
        );
    }

    private generateSnapshotPeriod(start: number, end: number): number {
        const daySeconds = 24 * 60 * 60;

        const range = end - start;

        if (range / daySeconds <= 2) {
            return 60 * 5;
        } else if (range / daySeconds < 30) {
            return 60 * 60;
        } else {
            return daySeconds;
        }
    }

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
                        ...constantConfig,
                        DataSource: this.generateDataSource(option),
                        ...advanceConfig,
                        ...this.generatePlatformOptionsForExchange(option, klinePeriodId),
                    };
                });
            })
        );
    }

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

    private generateDataSource(pair: BacktestSelectedPair): string {
        return this.constant.BACKTEST_PLATFORMS_CONFIG.find(item => item.eid === pair.eid).DataSource || pair.stock;
    }

    private generateFee(fee: number): number {
        return fee * 1000;
    }

    private generateBaseCurrency(stock: string): string {
        return stock.split('_')[0];
    }

    private generateBasePeriod(backtestLevel: number, klinePeriodId: number): number {
        return backtestLevel === 1 ? 1000 : this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes * 60000;
    }
}
