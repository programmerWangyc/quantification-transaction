import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, timer, merge, combineLatest, of, concat, zip } from 'rxjs';

import { GetTemplatesRequest, BacktestIORequest, BacktestIOType, SettingTypes } from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as Actions from '../../store/backtest/backtest.action';
import { AdvancedOption } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { BacktestSelectedPair, TimeRange, BacktestCode } from '../backtest.interface';
import { AdvancedOptionConfig, BacktestConstantService } from './backtest.constant.service';
import { environment } from '../../../environments/environment';
import { isNumber } from 'lodash';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { PublicService } from '../../providers/public.service';
import { BacktestComputingService } from './backtest.computing.service';
import { mapTo, take, switchMapTo, filter, map, partition, withLatestFrom, tap, distinct, distinctUntilChanged, switchMap, takeUntil, distinctUntilKeyChanged, scan, delayWhen } from 'rxjs/operators';
import { ServerBacktestCode, BacktestMilestone } from '../backtest.config';
import { BacktestParamService } from './backtest.param.service';

@Injectable()
export class BacktestService extends BacktestParamService {

    constructor(
        private process: ProcessService,
        private error: ErrorService,
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
        private publicService: PublicService,
        private computeService: BacktestComputingService,
    ) {
        super(store, constant);
    }

    /* =======================================================Serve Request======================================================= */

    launchBacktest(start: Observable<boolean>): Subscription {
        // TODO: 本地回测时使用，用于发出本地回测的信号。
        // const signal = language
        //     .map(lan => lan === Language.JavaScript)
        //     .withLatestFrom(
        //         this.getStrategyDetail().map(strategy => strategy.is_owner),
        //         (isJS, isOwner) => isJS && isOwner
        //     )

        /**
         *  回测前的动作：1、根据参数配置项生成需要测试的任务；2、将loading切换成回测中。
         *  注意：loading 将在回测结束后在 store 中被自动重置为false。
         */
        const generateToBeTestedValue$$ = start.subscribe(_ => {
            this.store.dispatch(new Actions.ToggleBacktestLoadingStateAction(true));
            this.store.dispatch(new Actions.GenerateToBeTestedValuesAction());
        });

        return this.launchServerBacktest(start)
            .add(generateToBeTestedValue$$)
            // 回测命令响应成功后，开始轮询回测的状态
            // .add(this.launchOperateBacktest(this.commandPollingBacktestState(), BacktestIOType.getTaskStatus))
            //回测任务完成，也就是收到服务端的消息之外，拉取回测结果
            .add(this.launchOperateBacktest(
                this.store.pipe(
                    select(fromRoot.selectBacktestServerSendMessage),
                    this.filterTruth()
                )
                , BacktestIOType.getTaskResult)
            );
    }

    /**
     * @description 服务端回测；1、第一个回测任务立即发起；2、之后的回测任务需要在服务端推送消息，也就是上个回测任务结束之后再发起。
     */
    private launchServerBacktest(signal: Observable<boolean>): Subscription {
        const notify = concat(
            of(true),
            this.store.pipe(
                select(fromRoot.selectBacktestServerSendMessage),
                this.filterTruth(),
                mapTo(true)
            )
        );

        return this.process.processBacktestIO(
            signal.pipe(
                switchMapTo(
                    zip(
                        this.getPutTaskParameters(),
                        notify
                    )
                        .pipe(
                            map(([params, _]) => params)
                        )
                )
            )
        );
    }

    /**
     * TODO:
     * @method launchLocalBacktest
     * @description 本地回测，在webworker中进行
     */
    private launchLocalBacktest(signal: Observable<boolean>): Subscription {

        const [isPro, isDev] = partition((flag: boolean) => flag)(
            signal.pipe(
                filter(res => res),
                mapTo(environment.production)
            )
        );

        const jsSetting$$ = this.launchJSSetting(isPro);

        const devEnvBacktest = isDev
            .pipe(
                switchMapTo(this.generatePutTaskParams()
                    .pipe(
                        map(task => ({ task, uri: '本地中的地址', blob: '' }))
                    ) // 本地调试时 blob 为空。
                )
            );

        const proEnvBacktest = isPro
            .pipe(
                switchMapTo(this.store.select(fromRoot.selectSettingsResponse)
                    .pipe(
                        filter(res => !res.error),
                        switchMapTo(this.publicService.getSetting(SettingTypes.backtest_javascript) as Observable<string>),
                        withLatestFrom(
                            this.generatePutTaskParams(),
                            (blob, task) => ({ task, blob, uri: '打包后放在服务器上的地址' })
                        )
                    )
                )
            );

        return this.computeService.handleBacktestInWorker(
            merge(devEnvBacktest, proEnvBacktest)
        )
            .add(jsSetting$$);
    }

    private launchJSSetting(signal: Observable<boolean>): Subscription {
        return this.publicService.launchGetSettings(
            signal.pipe(
                tap(_ => fromRoot.selectSettingsResponse.release()),
                mapTo(SettingTypes.backtest_javascript)
            )
        );
    }

    /**
     * @method launchGetTemplates
     * @description 获取模板的逻辑依赖于当前的选中的模板中是否有源码，如果没有源码，在用户选中模板后去获取源码，不会重复获取。
     */
    launchGetTemplates(): Subscription {
        return this.process.processGetTemplates(this.getTemplatesParams());
    }

    /**
     * @param taskType 回测任务的类型，BacktestIOType 中除了 putTask 以外的类型。
     * @description 获取操作的参数，包括轮询回测的状态，获取回测的结果，停止回测，杀掉回测。
     */
    private getBacktestTaskParams(taskType: string): Observable<BacktestIORequest> {
        const partialParam = withLatestFrom(
            this.getRunningNode(),
            this.getSelectedLanguage(),
            (uuid, nodeId, language) => ({ nodeId, language, io: JSON.stringify([taskType, uuid]) })
        );

        return taskType === BacktestIOType.getTaskStatus ? this.getUUid().pipe(
            partialParam
        ) : this.getUUid().pipe(
            partialParam,
            distinctUntilChanged(this.compareAllValues())
        )
    }

    /**
     * @method launchOperateBacktest
     * @param {Observable} command: 操作指令，指定操作应该发生的时机。
     * @param { string } taskType: 指令的类型
     * @description 发起对当前回测任务的操作，包括轮询回测的状态，获取回测的结果，停止回测，杀掉回测等。
     */
    launchOperateBacktest(command: Observable<any>, taskType: string): Subscription {
        return this.process.processBacktestIO(
            command.pipe(
                switchMapTo(
                    this.getBacktestTaskParams(taskType).pipe(
                        take(1)
                    )
                )
            )
        );
    }

    /* =======================================================Data acquisition======================================================= */

    getTemplatesParams(): Observable<GetTemplatesRequest> {
        return this.getSelectedTemplates()
            .pipe(
                map(templates => templates.filter(item => !item.source).map(item => item.id)),
                filter(ids => ids.length > 0),
                distinct(),
                map(ids => ({ ids }))
            );
    }

    private getGetTemplatesResponse(): Observable<fromRes.GetTemplatesResponse> {
        return this.store
            .pipe(
                select(fromRoot.selectGetTemplatesResponse),
                this.filterTruth()
            );
    }

    private getBacktestIOResponse(): Observable<number | fromRes.ServerBacktestResult<string | fromRes.BacktestTaskResult>> {
        return this.store
            .pipe(
                select(fromRoot.selectBacktestIOResponse),
                filter(this.isTruth),
                map(res => isNumber(res.result) ? <number>res.result : res.result)
            );
    }

    private filterPutTaskSuccessfulResponse(): Observable<fromRes.ServerBacktestResult<string>> {
        return this.store.pipe(
            select(fromRoot.selectBacktestState),
            map(res => res[BacktestIOType.putTask]),
            filter(result => {
                if (!result || isNumber(result)) {
                    return false;
                } else {
                    return result.Code === ServerBacktestCode.SUCCESS || result.Code === ServerBacktestCode.ALREADY_EXIST;
                }
            }),
        ) as Observable<fromRes.ServerBacktestResult<string>>;
    }

    /**
     * @description 获取当前回测任务的uuid
     */
    private getUUid(): Observable<string> {
        return this.filterPutTaskSuccessfulResponse().pipe(
            map(res => res.Result),
            distinctUntilChanged()
        );
    }

    /**
     * @description 当前查询当前回测状态的结果;
     */
    private getBacktestStatusResult(): Observable<fromRes.BacktestTaskResult> { // TODO: any： 回测状态查询的结果 回传的数据和轮询的数据应该是一样的结构（待确认）；
        const dataFromPolling = this.store.pipe(
            select(fromRoot.selectBacktestState),
            map(state => state[BacktestIOType.getTaskStatus]),
            filter(status => !!status && !isNumber(status)),
            map((status: fromRes.ServerBacktestResult<fromRes.BacktestTaskResult>) => status.Result)
        );

        const dataFromServerMsg = this.store.pipe(
            select(fromRoot.selectBacktestServerSendMessage),
            this.filterTruth(),
            map(state => state.status)
        );

        return merge(dataFromPolling, dataFromServerMsg)
    }

    /**
     * @description 在发起putTask成功后，开始定时向服务器轮询回测的状态。回测中止后停止轮询。
     */
    // private commandPollingBacktestState(): Observable<any> {
    //     return this.filterPutTaskSuccessfulResponse()
    //         .pipe(
    //             distinctUntilKeyChanged('Result'),
    //             map(response => response.Code === ServerBacktestCode.SUCCESS ? 500 : 0),
    //             switchMap(delay => timer(delay, 5000).pipe(
    //                 takeUntil(this.isBacktestComplete())
    //             ))
    //         );
    // }

    /* =======================================================UI state ======================================================= */

    getSelectedKlinePeriod(): Observable<number> {
        return this.getUIState()
            .pipe(
                map(res => res.timeOptions.klinePeriodId)
            );
    }

    getSelectedTimeRange(): Observable<TimeRange> {
        return this.getUIState()
            .pipe(
                map(res => {
                    const { start, end } = res.timeOptions;

                    return { start, end }; // may be null;
                })
            );
    }

    getAdvancedOptions(): Observable<AdvancedOption> {
        return this.getUIState()
            .pipe(
                map(res => res.advancedOptions)
            );
    }

    getBacktestBtnText(): Observable<string> {
        return this.getUIState()
            .pipe(
                map(state => {
                    const { backtestMilestone, isBacktesting } = state;

                    if (!isNaN(backtestMilestone)) {
                        return BacktestMilestone[backtestMilestone];
                    } else {
                        return isBacktesting ? 'BACKTESTING' : 'START_BACKTEST';
                    }
                })
            );
    }

    getBacktestTaskFilters(): Observable<Filter[]> {
        return this.getUIState()
            .pipe(
                map(res => res.backtestTaskFiler)
            );
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

    resetBacktestState(): void {
        this.store.dispatch(new Actions.ResetBacktestRelatedStateAction());
    }

    /* =======================================================Error handler======================================================= */

    handleGetTemplatesError(): Subscription {
        return this.error.handleResponseError(this.getGetTemplatesResponse());
    }

    handleBacktestIOError(): Subscription {
        return this.error.handleError(
            this.getBacktestIOResponse()
                .pipe(
                    map(res => this.error.getBacktestError(res))
                )
        );
    }
}
