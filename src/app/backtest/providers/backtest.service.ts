import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { isEmpty, isNull, isNumber } from 'lodash';
import { combineLatest, concat, never, Observable, of, Subscription, zip } from 'rxjs';
import {
    distinct,
    distinctUntilChanged,
    filter,
    map,
    mapTo,
    mergeMap,
    partition,
    skip,
    switchMap,
    switchMapTo,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { BacktestIORequest, BacktestIOType, GetTemplatesRequest, SettingTypes } from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import * as Actions from '../../store/backtest/backtest.action';
import { isStopBacktestFail } from '../../store/backtest/backtest.effect';
import { AdvancedOption } from '../../store/backtest/backtest.reducer';
import * as fromRoot from '../../store/index.reducer';
import { Language } from '../../strategy/strategy.config';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { BacktestMilestone, ServerBacktestCode } from '../backtest.config';
import { BacktestCode, BacktestSelectedPair, TimeRange } from '../backtest.interface';
import { BacktestComputingService } from './backtest.computing.service';
import { AdvancedOptionConfig, BacktestConstantService } from './backtest.constant.service';
import { BacktestParamService } from './backtest.param.service';

@Injectable()
export class BacktestService extends BacktestParamService {

    constructor(
        private process: ProcessService, private error: ErrorService,
        public store: Store<fromRoot.AppState>,
        public constant: BacktestConstantService,
        private publicService: PublicService,
        private computeService: BacktestComputingService,
        public tipService: TipService,
        private router: Router,
    ) {
        super(store, constant);
    }

    //  =======================================================Serve Request=======================================================

    /**
     * 回测入口函数；
     * @param start 用户发起的开始回测的信号
     */
    launchBacktest(start: Observable<boolean>): Subscription {
        const [atLocal, atServer] = partition((atLocal: boolean) => atLocal)(this.isLocalBacktest(start))

        const server$$ = this.startServerBacktest(atServer);

        const local$$ = this.startLocalBacktest(atLocal);

        /**
         * 回测前的动作：根据参数配置项生成需要测试的任务；
         */
        const generateToBeTestedValue$$ = start.subscribe(_ => this.store.dispatch(new Actions.GenerateToBeTestedValuesAction()));

        return local$$
            .add(server$$)
            .add(generateToBeTestedValue$$);
    }

    /**
     * 发起服务端回测
     */
    private startServerBacktest(start: Observable<boolean>): Subscription {

        //回测任务完成，也就是收到服务端的消息之外，拉取回测结果
        return this.launchOperateBacktest(
            this.store.pipe(
                select(fromRoot.selectBacktestServerSendMessage),
                this.filterTruth(),
                takeUntil(this.router.events) // FIXME: 从路由的变化结束流，有点恶心。
            ),
            BacktestIOType.getTaskResult
        )
            // 删除回测任务，在获取taskResult成功之后，将任务删除。
            .add(this.launchOperateBacktest(
                this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result).pipe(
                    map(res => !!this.error.getBacktestError(res.result)),
                    filter(err => !err)
                ),
                BacktestIOType.deleteTask
            ))
            .add(this.launchServerBacktest(this.guardBacktestStart(start)))
    }

    /**
     * 是否在客户端进行回测
     * @param start 用户发起的回测信号
     * @returns 执行回测的位置信号，true: 在客户端使用webworker进行回测；false：通知服务端进行回测
     */
    isLocalBacktest(start: Observable<boolean>): Observable<boolean> {
        const result = zip(
            this.store.pipe(
                select(fromRoot.selectStrategyUIState),
                map(state => state.selectedLanguage === Language.JavaScript),
            ),
            this.getStrategyDetail().pipe(
                map(strategy => strategy.is_owner)
            )
        ).pipe(
            map(([isJS, isOwner]) => isJS && isOwner),
            take(1)
        );

        return start.pipe(
            switchMapTo(result)
        );
    }

    /**
     * 服务端回测；
     * 1、第一个回测任务立即发起；
     * 2、之后的回测任务在当前回测的结果响应后发起，也就是上个回测任务的 result 接收完成后再发起。
     * FIXME: 下一个回测任务应该在收到服务端的推送消息后发起，但目前由于 getBacktestResult 的响应中没有带uuid，此时发起可能导致
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
                        map(([params, _]) => params),
                        takeUntil(this.getUIState().pipe(
                            map(state => state.backtestMilestone),
                            skip(1),
                            filter(milestone => isNull(milestone))
                        ))
                    )
                )
            )
        );
    }

    /**
     * 本地回测，在webworker中进行
     */
    private startLocalBacktest(signal: Observable<boolean>): Subscription {
        const params = combineLatest(
            this.publicService.getSetting(SettingTypes.backtest_javascript).pipe(
                tap(res => !res && this.publicService.launchGetSettings(of(SettingTypes.backtest_javascript))),
                this.filterTruth()
            ),
            this.generatePutTaskParams(),
            this.store.pipe(
                select(fromRoot.selectWorkerResult),
                map(res => !res ? {} : res.httpCache || {})
            )
        ).pipe(
            take(1),
            mergeMap(([blob, task, cache]) => {
                this.store.dispatch(new Actions.IncreaseBacktestingTaskIndex());

                return this.computeService.run({ task, blob, cache })
            })
        );

        return this.process.processWorkBacktest(this.guardBacktestStart(signal).pipe(
            switchMapTo(params)
        ));
    }

    /**
     * 获取模板的逻辑依赖于当前的选中的模板中是否有源码，如果没有源码，在用户选中模板后去获取源码，不会重复获取。
     */
    launchGetTemplates(): Subscription {
        return this.process.processGetTemplates(this.getTemplatesParams());
    }

    /**
     * 获取操作的参数，包括轮询回测的状态，获取回测的结果，停止回测，杀掉回测。
     * @param taskType 回测任务的类型，BacktestIOType 中除了 putTask 以外的类型。
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
     * 发起对当前回测任务的操作，包括轮询回测的状态，获取回测的结果，停止回测，杀掉回测等。
     * @param command: 操作指令，指定操作应该发生的时机。
     * @param taskType: 指令的类型
     * @param force: 是否强制发起，默认情况下只在回测开关开启时才发起任务。
     */
    launchOperateBacktest(command: Observable<any>, taskType: string, force: boolean = false): Subscription {
        const params = this.getBacktestTaskParams(taskType).pipe(
            take(1)
        );

        const serverMsgSubscribeState = this.publicService.getServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST);

        return this.process.processBacktestIO(
            command.pipe(
                switchMapTo(
                    force ? params : params.pipe(
                        withLatestFrom(serverMsgSubscribeState),
                        filter(([_, onOff]) => onOff),
                        map(([params, _]) => params)
                    )
                )
            )
        );
    }

    /**
     * 回测开始的守卫。用户发起的回测动作只有经过守卫以后才可以发起。
     * 注意：loading 的 false 状态逻辑只存在于 store 中。
     */
    private guardBacktestStart(wantStart: Observable<boolean>): Observable<boolean> {
        return wantStart.pipe(
            switchMapTo(this.isBacktestArgsValid().pipe(
                tap(isValid => !isValid && this.tipService.messageError('COMBINATION_ARGS_EMPTY_ERROR')),
                switchMap(isValid => isValid ? of(true) : never()),
                tap(_ => this.store.dispatch(new Actions.OpenBacktestLoadingStateAction()))
            ))
        );
    }

    /**
     * 停止在webworker中的回测任务。
     */
    stopRunWorker(command: Observable<any>): Subscription {
        return this.computeService.stopRun(command);
    }

    //  =======================================================Data acquisition=======================================================

    getTemplatesParams(): Observable<GetTemplatesRequest> {
        return this.getSelectedTemplates().pipe(
            map(templates => templates.filter(item => !item.source).map(item => item.id)),
            filter(ids => ids.length > 0),
            distinct(),
            map(ids => ({ ids }))
        );
    }

    private getGetTemplatesResponse(): Observable<fromRes.GetTemplatesResponse> {
        return this.store.pipe(
            select(fromRoot.selectGetTemplatesResponse),
            this.filterTruth()
        );
    }

    /**
     * 获取回测接口的响应，如果传入回测的callbackId，则只会获取到指定的响应，否则将会获取到所有通过backtestIO接口接收到的响应。
     */
    private getBacktestIOResponse(callbackId?: string): Observable<fromRes.BacktestIOResponse> {
        return this.store.pipe(
            select(fromRoot.selectBacktestIOResponse),
            filter(res => !!res && (callbackId ? res.action === callbackId : true))
        );
    }

    /**
     * 获取 putTask 的成功后的响应，putTask 成功响应字段中的 Result 即为 uuid。获取此ID后才能对任务发起接下去的操作，如查询结果，停止回测等。
     */
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
     * 获取当前回测任务的uuid
     */
    private getUUid(): Observable<string> {
        return this.filterPutTaskSuccessfulResponse().pipe(
            map(res => res.Result),
            distinctUntilChanged()
        );
    }

    /**
     * 停止回测是否执行成功
     */
    isStopSuccess(): Observable<boolean> {
        return this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.stop).pipe(
            map(res => !isStopBacktestFail(res))
        );
    }

    //  =======================================================UI state =======================================================

    getSelectedKlinePeriod(): Observable<number> {
        return this.getUIState().pipe(
            map(res => res.timeOptions.klinePeriodId)
        );
    }

    getSelectedTimeRange(): Observable<TimeRange> {
        return this.getUIState().pipe(
            map(res => {
                const { start, end } = res.timeOptions;

                return { start, end }; // may be null;
            })
        );
    }

    getAdvancedOptions(): Observable<AdvancedOption> {
        return this.getUIState().pipe(
            map(res => res.advancedOptions)
        );
    }

    /**
     *  获取回测按钮在不同状态下应该显示的文本信息；
     * 1、正常状态显示 开始回测；
     * 2、参数计算阶段显示 正在加载回测信息
     * 3、发起回测后显示 回测中
     * 4、获取日志时显示 正在拉取回测日志
     */
    getBacktestBtnText(): Observable<string> {
        return this.getUIState().pipe(
            map(state => {
                const { backtestMilestone, isBacktesting } = state;

                if (!isNull(backtestMilestone)) {
                    return BacktestMilestone[backtestMilestone];
                } else {
                    return isBacktesting ? 'BACKTESTING' : 'START_BACKTEST';
                }
            })
        );
    }

    getBacktestTaskFilters(): Observable<Filter[]> {
        return this.getUIState().pipe(
            map(res => res.backtestTaskFiler)
        );
    }

    /**
     * 是否处于回测中状态。
     */
    isBacktesting(): Observable<boolean> {
        return this.getUIState().pipe(
            map(state => state.isBacktesting)
        );
    }

    /**
     * 回测的参数是否设置正确。
     * 1、不是调优回测时，默认为 true；
     * 2、调优回测时，是否生成了可供回测的参数组合；
     */
    isBacktestArgsValid(): Observable<boolean> {
        return this.getUIState().pipe(
            filter(({ backtestCode, backtestTasks }) => !!backtestCode && !!backtestTasks),
            map(({ backtestCode, backtestTasks }) => this.isOptimizing(backtestCode) ? !isEmpty(backtestTasks) : true),
            take(1)
        );
    }

    //  =======================================================Local state change=======================================================

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

    //  =======================================================Error handler=======================================================

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
