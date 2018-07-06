import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { isNumber } from 'lodash';
import { concat, merge, Observable, of, Subscription, zip } from 'rxjs';
import {
    distinct,
    distinctUntilChanged,
    filter,
    map,
    mapTo,
    partition,
    switchMapTo,
    take,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { BacktestIORequest, BacktestIOType, GetTemplatesRequest, SettingTypes } from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { PublicService } from '../../providers/public.service';
import * as Actions from '../../store/backtest/backtest.action';
import { isStopBacktestFail } from '../../store/backtest/backtest.effect';
import { AdvancedOption } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { BacktestMilestone, ServerBacktestCode } from '../backtest.config';
import { BacktestCode, BacktestSelectedPair, TimeRange } from '../backtest.interface';
import { BacktestComputingService } from './backtest.computing.service';
import { AdvancedOptionConfig, BacktestConstantService } from './backtest.constant.service';
import { BacktestParamService } from './backtest.param.service';
import { getTradeCount } from './backtest.result.service';

@Injectable()
export class BacktestService extends BacktestParamService {

    constructor(
        private process: ProcessService, private error: ErrorService,
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
         *  注意：loading 的 false 状态逻辑只存在于 store 中。
         */
        const generateToBeTestedValue$$ = start.subscribe(_ => {
            this.store.dispatch(new Actions.OpenBacktestLoadingStateAction());
            this.store.dispatch(new Actions.GenerateToBeTestedValuesAction());
        });

        return this.launchServerBacktest(start)
            .add(generateToBeTestedValue$$)
            //回测任务完成，也就是收到服务端的消息之外，拉取回测结果
            .add(this.launchOperateBacktest(
                this.store.pipe(
                    select(fromRoot.selectBacktestServerSendMessage),
                    this.filterTruth()
                ),
                BacktestIOType.getTaskResult
            ))
            // 删除回测任务，在获取taskResult成功之后，将任务删除。
            .add(this.launchOperateBacktest(
                this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result),
                BacktestIOType.deleteTask
            ))
    }

    /**
     * @description 服务端回测；
     * 1、第一个回测任务立即发起；
     * 2、之后的回测任务在当前回测的结果响应后发起，也就是上个回测任务的 result 接收完成后再发起。
     * FIXME: 下一个回测任务应该在，收到服务端的推送消息后发起，但目前由于 getBacktestResult 的响应中没有带uuid，此时发起可能导致
     * 结果与请求无法对应，因此暂时在当前的任务结果接收完成后再发起下一次任务。
     * 2、之后的回测任务需要在服务端推送消息，也就是上个回测任务结束之后再发起。
     */
    private launchServerBacktest(signal: Observable<boolean>): Subscription {
        const notify = concat(
            of(true),
            this.store.pipe(
                select(fromRoot.selectBacktestIOResponse),
                filter(res => res && res.action === Actions.BacktestOperateCallbackId.result),
                withLatestFrom(this.publicService.getServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST)),
                filter(([_, onOff]) => onOff),
                mapTo(true)
            )
        );

        return this.process.processBacktestIO(
            signal.pipe(
                switchMapTo(
                    zip(
                        this.getPutTaskParameters(),
                        notify
                    ).pipe(
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
     * @param { Observable } command: 操作指令，指定操作应该发生的时机。
     * @param { string } taskType: 指令的类型
     * @param { boolean } force: 是否强制发起，默认情况下只在回测开关开启时才发起任务。
     * @description 发起对当前回测任务的操作，包括轮询回测的状态，获取回测的结果，停止回测，杀掉回测等。
     */
    launchOperateBacktest(command: Observable<any>, taskType: string, force = false): Subscription {
        const params = this.getBacktestTaskParams(taskType).pipe(
            take(1)
        );

        return this.process.processBacktestIO(
            command.pipe(
                switchMapTo(
                    force ? params : params.pipe(
                        withLatestFrom(this.publicService.getServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST)),
                        filter(([_, onOff]) => onOff),
                        map(([params, _]) => params)
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

    /**
     * @description 获取回测接口的响应，如果传入回测的callbackId，则只会获取到指定的响应，否则将会获取到所有通过backtestIO接口接收到的响应。
     */
    private getBacktestIOResponse(callbackId?: string): Observable<fromRes.BacktestIOResponse> {
        return this.store
            .pipe(
                select(fromRoot.selectBacktestIOResponse),
                filter(res => !!res && (callbackId ? res.action === callbackId : true))
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
     * @description 获取回测任务的结果。
     */
    getBacktestTaskResults(): Observable<fromRes.BacktestIOResponse[]> {
        return this.store.pipe(
            select(fromRoot.selectBacktestResults),
            this.filterTruth()
        );
    }

    isStopSuccess(): Observable<boolean> {
        return this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.stop).pipe(
            map(res => !isStopBacktestFail(res))
        );
    }

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

    /**
     * @description 回测进度 = 收到的服务器响应数 / 回测任务数
     */
    getBacktestProgress(): Observable<number> {
        return this.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            map(state => state.backtestTasks.length || 1),
            withLatestFrom(this.store.pipe(
                select(fromRoot.selectBacktestServerMessages),
                this.filterTruth(),
                map(messages => messages.length)
            ),
                (total, completed) => (completed / total) * 100
            )
        );
    }

    /**
     * @description 是否处于回测中状态。
     */
    isBacktesting(): Observable<boolean> {
        return this.getUIState().pipe(
            map(state => state.isBacktesting)
        );
    }

    /**
     * @param {string} statistic - 字段名称
     * @description 获取回测的统计数据。
     */
    getBacktestStatistics(statistic: string): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectBacktestResults),
            this.filterTruth(),
            map(results => results.map(item => {
                const { Result, Code } = <fromRes.ServerBacktestResult<string>>item.result;

                if (Code === ServerBacktestCode.SUCCESS) {
                    const messages = <fromRes.BacktestResult>JSON.parse(Result);

                    return messages[statistic];
                } else {
                    return 0;
                }
            })
                .reduce((acc, cur) => acc + cur, 0)
            )
        );
    }

    /**
     * @description 获取交易次数总计；
     */
    getTradeCount(): Observable<number> {
        return this.store.pipe(
            select(fromRoot.selectBacktestResults),
            this.filterTruth(),
            map(messages => messages.reduce((acc, cur) => {
                const { Result, Code } = <fromRes.ServerBacktestResult<string>>cur.result;

                return Code === ServerBacktestCode.SUCCESS ? getTradeCount(JSON.parse(Result)) + acc : acc;
            }, 0)),
            filter(count => !isNaN(count))
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
            this.getBacktestIOResponse().pipe(
                map(res => this.error.getBacktestError(res.result))
            )
        );
    }

    handleStopBacktestError(): Subscription {
        return this.error.handleError(
            of('STOP_BACKTEST_ERROR'),
            this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.stop).pipe(
                map(res => <string>res.result)
            )
        );
    }
}
