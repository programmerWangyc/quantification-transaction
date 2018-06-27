import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BaseService } from '../../base/base.service';
import { GetTemplatesRequest, PutTaskCode, PutTaskCodeArg, BacktestExchange, BacktestAdvanceOptions, BacktestPlatformOptions, BacktestConstantOptions, BacktestPutTaskOptions, BacktestPutTaskParams, BacktestIORequest, BacktestDescription, SettingTypes } from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { TemplateSnapshot } from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as Actions from '../../store/backtest/backtest.action';
import { AdvancedOption, UIState } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { BacktestSelectedPair, TimeRange, BacktestCode, WorkerBacktest, WorkerBacktestRequest } from '../backtest.interface';
import { AdvancedOptionConfig, BacktestConstantService } from './backtest.constant.service';
import { environment } from '../../../environments/environment';
import { isNumber, omit } from 'lodash';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { VariableOverview } from '../../interfaces/app.interface';
import { VariableType } from '../../app.config';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../../strategy/strategy.config';
import { PublicService } from '../../providers/public.service';
import { BacktestComputingService } from './backtest.computing.service';

import { Http, Response } from '@angular/http';

// export const workerUrl = '../../../assets/sandbox/worker.js'

@Injectable()
export class BacktestService extends BaseService {

    constructor(
        private process: ProcessService,
        private error: ErrorService,
        private store: Store<fromRoot.AppState>,
        private constant: BacktestConstantService,
        private translate: TranslateService,
        private publicService: PublicService,
        private computeService: BacktestComputingService,
    ) {
        super();
    }

    /* =======================================================Serve Request======================================================= */

    launchBacktest(language: Observable<number>): Subscription {
        const generateToBeTestedValue$$ = language.subscribe(_ => this.store.dispatch(new Actions.GenerateToBeTestedValuesAction()));

        // TODO: 本地回测时使用，用于发出本地回测的信号。
        // const signal = language
        //     .map(lan => lan === Language.JavaScript)
        //     .withLatestFrom(
        //         this.getStrategyDetail().map(strategy => strategy.is_owner),
        //         (isJS, isOwner) => isJS && isOwner
        //     )

        return this.launchServerBacktest(language.mapTo(true))
            // .add(this.launchLocalBacktest(signal))
            .add(generateToBeTestedValue$$);
    }

    /**
     * @description 服务端回测
     */
    private launchServerBacktest(signal: Observable<boolean>): Subscription {
        return this.process.processBacktestIO(
            signal
                // .filter(res => !res)
                .switchMapTo(this.getBacktestIOParameters().take(1))
        );
    }

    /**
     * TODO:
     * @method launchLocalBacktest
     * @description 本地回测，在webworker中进行
     */
    private launchLocalBacktest(signal: Observable<boolean>): Subscription {
        const [isPro, isDev] = signal
            .filter(res => res)
            .map(_ => environment.production)
            .partition(isPro => isPro);

        const jsSetting$$ = this.launchJSSetting(isPro);

        const devEnvBacktest = isDev.switchMapTo(this.generatePutTaskParams().map(task => ({ task, uri: '本地中的地址', blob: '' }))); // 本地调试时 blob 为空。

        const proEnvBacktest = isPro.switchMapTo(this.store.select(fromRoot.selectSettingsResponse)
            .filter(res => !res.error)
            .switchMapTo(this.publicService.getSetting(SettingTypes.backtest_javascript) as Observable<string>)
            .withLatestFrom(this.generatePutTaskParams(), (blob, task) => ({ task, blob, uri: '打包后放在服务器上的地址' }))
        );

        return this.computeService.handleBacktestInWorker(devEnvBacktest.merge(proEnvBacktest))
            .add(jsSetting$$);
    }

    private launchJSSetting(signal: Observable<boolean>): Subscription {
        return this.publicService.launchGetSettings(
            signal.do(_ => fromRoot.selectSettingsResponse.release())
                .mapTo(SettingTypes.backtest_javascript)
        );
    }

    /**
     * @method launchGetTemplates
     * @description 获取模板的逻辑依赖于当前的选中的模板中是否有源码，如果没有源码，在用户选中模板后去获取源码，不会重复获取。
     */
    launchGetTemplates(): Subscription {
        return this.process.processGetTemplates(this.getTemplatesParams());
    }

    /* =======================================================Data acquisition======================================================= */

    getSelectedTemplateIds(): Observable<number[]> {
        return this.store.select(fromRoot.selectStrategyUIState)
            .map(res => res.selectedTemplates)
            .filter(this.isTruth);
    }

    getTemplatesParams(): Observable<GetTemplatesRequest> {
        return this.getSelectedTemplates()
            .map(templates => templates.filter(item => !item.source).map(item => item.id))
            .filter(ids => ids.length > 0)
            .distinct()
            .map(ids => ({ ids }));
    }

    /**
     * @param releaseCache - 是否释放输出流中的缓存值。
     * @description 获取用户选中的模板，模板数据源是strategy list 的响应和strategy detail 响应中的 templates字段
     */
    getSelectedTemplates(releaseCache = true): Observable<TemplateSnapshot[]> {
        releaseCache && fromRoot.selectStrategyDetailResponse.release();

        return this.getSelectedTemplateIds()
            .combineLatest(
                this.store.select(fromRoot.selectBacktestTemplates).filter(this.isTruth),
                (ids, templates) => templates.filter(({ id }) => ids.includes(id))
            );
    }

    private getGetTemplatesResponse(): Observable<fromRes.GetTemplatesResponse> {
        return this.store.select(fromRoot.selectGetTemplatesResponse)
            .filter(this.isTruth);
    }

    private getBacktestIOResponse(): Observable<number | fromRes.ServerBacktestResult> {
        return this.store.select(fromRoot.selectBacktestIOResponse)
            .filter(this.isTruth)
            .map(res => isNumber(res.result) ? <number>res.result : <fromRes.ServerBacktestResult>JSON.parse(res.result));
    }

    private getStrategyDetail(): Observable<fromRes.StrategyDetail> {
        return this.store.select(fromRoot.selectStrategyDetailResponse)
            .filter(res => !!res)
            .map(res => res.result.strategy);
    }

    private getSelectedLanguage(): Observable<number> {
        return this.store.select(fromRoot.selectStrategyUIState)
            .filter(res => !!res)
            .map(state => state.selectedLanguage);
    }



    /* =======================================================UI state ======================================================= */

    getUIState(): Observable<UIState> {
        return this.store.select(fromRoot.selectBacktestUIState);
    }

    getSelectedKlinePeriod(): Observable<number> {
        return this.getUIState().map(res => res.timeOptions.klinePeriodId);
    }

    getSelectedTimeRange(): Observable<TimeRange> {
        return this.getUIState().map(res => {
            const { start, end } = res.timeOptions;

            return { start, end }; // may be null;
        });
    }

    getAdvancedOptions(): Observable<AdvancedOption> {
        return this.getUIState().map(res => res.advancedOptions);
    }

    getBacktestBtnText(): Observable<string> {
        return this.getUIState().map(res => res.isBacktesting ? 'BACKTEST_SYSTEM_LOADING' : 'START_BACKTEST');
    }

    getRunningNode(): Observable<number> {
        return this.getUIState().map(res => res.runningNode);
    }

    getBacktestCode(): Observable<BacktestCode[]> {
        return this.getUIState().map(res => res.backtestCode);
    }

    getBacktestTaskFilters(): Observable<Filter[]> {
        return this.getUIState().map(res => res.backtestTaskFiler);
    }

    /* =======================================================Local state change======================================================= */

    updateSelectedTimeRange(range: TimeRange): void {
        this.store.dispatch(new Actions.UpdateSelectedTimeRangeAction(range));
    }

    updateSelectedKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateSelectedKlinePeriodAction(id));
    }

    updateAdvancedOption(target: AdvancedOptionConfig): void {
        this.store.dispatch(new Actions.UpdateBacktestAdvancedOption({ [target.storageKey]: target.value }));
    }

    updateFloorKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateFloorKlinePeriodAction(id));
    }

    updatePlatformOptions(source: BacktestSelectedPair[]): void {
        this.store.dispatch(new Actions.UpdateBacktestPlatformOptionAction(source));
    }

    updateRunningNode(source: Observable<number>): Subscription {
        return source.subscribe(node => this.store.dispatch(new Actions.UpdateBacktestRunningNodeAction(node)));
    }

    toggleBacktestMode(): void {
        this.store.dispatch(new Actions.ToggleBacktestModeAction());
    }

    updateBacktestCode(content: BacktestCode): void {
        this.store.dispatch(new Actions.UpdateBacktestCodeAction(content));
    }

    updateBacktestArgFilters(source: Filter[]): void {
        this.store.dispatch(new Actions.UpdateBacktestArgFilterAction(source));
    }

    updateBacktestLevel(level: number): void {
        this.store.dispatch(new Actions.UpdateBacktestLevelAction(level));
    }

    /* =======================================================Backtest IO parameters======================================================= */

    /**
     * @description 获取回测接口 backtestIO 的参数。
     */
    private getBacktestIOParameters(): Observable<BacktestIORequest> {
        return this.getStrategyDetail()
            .combineLatest(
                this.getSelectedLanguage(),
                this.getUIState().map(state => state.runningNode),
                this.generatePutTaskParams(),
                ({ is_owner }, language, node, task) => ({
                    nodeId: is_owner ? node : 0,
                    language: is_owner ? language : language + 1000,
                    info: task
                })
            )
            .map(({ nodeId, language, info }) => ({ nodeId, language, io: JSON.stringify([BacktestDescription.putTask, this.constant.BACK_END_LANGUAGES[language], JSON.stringify(info)]) }))
            .distinctUntilChanged((previous, current) => Object.keys(current).every(key => previous[key] === current[key]))
    }

    /**
     * @description 生成回测任务的参数
     */
    private generatePutTaskParams(): Observable<BacktestPutTaskParams> {
        return this.generatePutTaskCode()
            .zip(
                this.generatePutTaskExchange(),
                this.generatePutTaskOptions(),
                (code, exchange, options) => ({ Code: code, Exchanges: exchange, Options: options, Start: options.TimeBegin, End: options.TimeEnd })
            )
            .distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current));
    }

    /**
     * @description 生成回测时所需要的Code字段的值。
     */
    private generatePutTaskCode(): Observable<PutTaskCode[]> {

        const getValue = (overview: VariableOverview): string | boolean | number => {
            if (overview.variableTypeId === VariableType.SELECT_TYPE) {
                return this.constant.transformStringToList(<string>overview.originValue).findIndex(item => item === overview.variableValue);
            } else {
                return overview.variableValue;
            }
        }

        return this.getBacktestCode()
            .map(codes => codes.map(code => {
                const { name, id, args } = code;

                const result: PutTaskCodeArg[] = args.map(arg => <PutTaskCodeArg>[this.constant.removeConditionInName(arg.variableName), getValue(arg), arg.variableTypeId]);

                return { name, id, args: result };
            }))
            .combineLatest(
                this.getSelectedTemplates(false),
                this.getStrategyDetail(),
                (tasks, templates, strategy) => tasks.map(task => {
                    const { id, name, args } = task;

                    const sourceKey = !!strategy.is_owner ? 'source' : 'id'; // 用户不能看代码时统一传id。

                    const code = name === this.constant.MAIN_CODE_FLAG ? strategy[sourceKey] : templates.find(template => template.id === id)[sourceKey];

                    return [code, args, name] as PutTaskCode;
                }));
    }

    /**
     * @description 生成回测时所需的 Options 字段。
     */
    private generatePutTaskOptions(): Observable<BacktestPutTaskOptions> {
        return this.getUIState()
            .combineLatest(this.getUpdatePeriod(), ({ advancedOptions, timeOptions, backtestLevel, backtestTasks }, updatePeriod) => {
                const { log, profit, chart, delay } = advancedOptions;

                const { start, end, klinePeriodId } = timeOptions;

                const begin = <number>moment(start).unix();

                const finish = <number>moment(end).unix();

                const isMultipleTask = !!backtestTasks.length;

                return {
                    RetFlags: this.getRetFlags(isMultipleTask, backtestLevel),
                    MaxRuntimeLogs: isMultipleTask ? 0 : log,
                    MaxProfitLogs: profit,
                    MaxChartLogs: isMultipleTask ? 0 : chart,
                    DataServer: 'https://www.botvs.com',
                    // CPP
                    TimeBegin: begin,
                    TimeEnd: finish,
                    SnapshortPeriod: this.generateSnapshotPeriod(begin, finish) * 1000,
                    Period: this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes * 60 * 1000,
                    NetDelay: Math.max(1, delay),
                    UpdatePeriod: updatePeriod,
                }
            })
    }

    /**
     *
     * @param isMultipleTask 是否多任务，即用户是否设置了有效的调优参数。
     * @param level 回测的级别，模拟 or 实盘。
     * @description 生成回测 Options 中的 RetFlags 的值。
     */
    private getRetFlags(isMultipleTask: boolean, level: number): number {
        if (isMultipleTask) {
            return this.constant.BT_PROFIT_LOGS | this.constant.BT_CLOSE_PROFIT_LOGS | this.constant.BT_ACCOUNTS;
        }

        let result = this.constant.getRetFlags();

        if (level === 0) {
            return result | this.constant.BT_SYMBOLS | this.constant.BT_INDICATORS;
        } else {
            return result;
        }
    }

    /**
     * @description 生成回测 Options 中的 UpdatePeriod 的值。
     */
    private getUpdatePeriod(): Observable<number> {
        return this.getSelectedLanguage().map(language => language === 1 ? 5000 : 500);
    }

    /**
     *
     * @param start 回测开始时间
     * @param end 回测结束时间
     * @description 生成回测 Options 中的 SnapshotPeriod 字段的基础值。
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
     * @method generatePutTaskExchange
     * @description 生成回测时所需要的 Exchanges 字段的值。
     */
    private generatePutTaskExchange(): Observable<BacktestExchange[]> {
        return this.getUIState()
            .map(state => {
                const { timeOptions, floorKlinePeriod, advancedOptions, platformOptions, isFaultTolerantMode, backtestLevel } = state;

                const { klinePeriodId } = timeOptions;

                const advanceConfig = this.generateAdvanceOptionsForExchange(advancedOptions, isFaultTolerantMode, backtestLevel, floorKlinePeriod);

                return platformOptions.map(option => {
                    const { eid, stock, makerFee, takerFee } = option;

                    const constantConfig: BacktestConstantOptions = omit(this.constant.BACKTEST_PLATFORMS_CONFIG.find(item => item.eid === eid), ['eid']) as BacktestConstantOptions;

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
            });
    }

    /**
     * @description 生成回测字段 Exchange 中的高级选项的配置。
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
     * @description 生成回测字段 Exchange 中的平台选项的配置。
     */
    private generatePlatformOptionsForExchange(platform: BacktestSelectedPair, klinePeriodId: number): BacktestPlatformOptions {
        const { eid, name, stock, makerFee, takerFee, balance, remainingCurrency, minFee } = platform;
        let label = '';

        this.translate.get(name).subscribe(result => label = result);

        return {
            Name: eid,
            Label: label,
            Balance: balance || 0,
            Stocks: remainingCurrency || 0,
            Fee: [makerFee, takerFee],
            MinFee: minFee || 0,
            Period: this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes,
            Currency: stock,
            QuoteCurrency: this.constant.BACKTEST_PLATFORMS.find(item => item.eid === eid).quoteCurrency,
        }
    }

    /**
     * @description 常量配置中的 DataSource 的值。
     */
    private generateDataSource(pair: BacktestSelectedPair): string {
        return this.constant.BACKTEST_PLATFORMS_CONFIG.find(item => item.eid === pair.eid).DataSource || pair.stock;
    }

    /**
     * @description 生成回测配置 Exchange 中的 FeeMaker, FeeTaker的值。
     */
    private generateFee(fee: number): number {
        return fee * 1000;
    }

    /**
     * @description 生成回测配置 Exchange 中BaseCurrency字段的值
     */
    private generateBaseCurrency(stock: string): string {
        return stock.split('_')[0];
    }

    /**
     * @description 生成回测配置 Exchange 中BasePeriod字段的值
     */
    private generateBasePeriod(backtestLevel: number, klinePeriodId: number): number {
        return backtestLevel === 1 ? 1000 : this.constant.K_LINE_PERIOD.find(item => item.id === klinePeriodId).minutes * 60000;
    }

    /* =======================================================Error handler======================================================= */

    handleGetTemplatesError(): Subscription {
        return this.error.handleResponseError(this.getGetTemplatesResponse());
    }

    handleBacktestIOError(): Subscription {
        return this.error.handleError(
            this.getBacktestIOResponse()
                .map(res => this.error.getBacktestError(res))
        );
    }
}
