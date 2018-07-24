import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { isEmpty, isNull, isNumber } from 'lodash';
import { combineLatest, concat, interval, merge, never, Observable, of, Subscription, zip } from 'rxjs';
import {
    distinct,
    distinctUntilChanged,
    filter,
    map,
    mapTo,
    mergeMap,
    mergeMapTo,
    partition,
    skip,
    startWith,
    switchMap,
    switchMapTo,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { BacktestIORequest, BacktestIOType, SettingTypes } from '../../interfaces/request.interface';
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
import { BacktestMilestone, ServerBacktestCode, ServerBacktestTaskStatus } from '../backtest.config';
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
     * 回测入口函数，会将用户发起的回测信号流拆分成服务端和客户端两条流，然后再将这两条流交给各自的回测流程。
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

        return generateToBeTestedValue$$
            .add(local$$)
            .add(server$$);
    }

    /**
     * 发起服务端回测
     * @param start 开始服务端回测的信号
     */
    private startServerBacktest(start: Observable<boolean>): Subscription {

        //回测任务完成，也就是收到服务端的消息之后，拉取回测结果
        return this.launchOperateBacktest(
            this.getServerSendBacktestMsg().pipe(
                takeUntil(this.router.events)
            ),
            BacktestIOType.getTaskResult
        )
            // 轮询服务端回测进度
            .add(this.launchOperateBacktest(
                this.pollingBacktestStatus(start),
                BacktestIOType.getTaskStatus
            ))
            // 删除回测任务，在获取taskResult成功之后，将任务删除。
            .add(this.launchOperateBacktest(
                this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result).pipe(
                    filter(res => !this.error.getBacktestError(res.result))
                ),
                BacktestIOType.deleteTask
            ))
            // 发起回测
            .add(this.launchServerBacktest(this.guardBacktestStart(start)))
    }

    /**
     * 1、服务端回测信号发出后，需要监视putTask的响应是否成功，实际轮询的开始时间是在响应成功之后。
     * 2、轮询间隔：2秒
     * 3、在回测任务全部完成是，结束轮询
     * @param start 服务端回测开始时的信号
     * @returns 轮询信号
     */
    private pollingBacktestStatus(start: Observable<boolean>): Observable<boolean> {
        // putTask 成功后2秒开始轮询，服务端推送回消息以后结束轮询
        const pollingStart = this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.backtest).pipe(
            filter(res => !this.error.getBacktestError(res.result)),
            mergeMapTo(interval(2000).pipe(
                mapTo(true),
                takeUntil(merge(this.getServerSendBacktestMsg(), this.isBacktestTerminate()))
            ))
        );


        // 所有的任务都结束后停止轮询，这个时间早于回测结果全部拉取完成的时间
        const pollingEnd = this.isAllTasksCompleted().pipe(
            this.filterTruth()
        );

        return start.pipe(
            switchMapTo(
                pollingStart.pipe(
                    takeUntil(pollingEnd)
                )
            )
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
            this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result).pipe(
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
        const notify = concat(
            of(true),
            this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result),
        );

        const blob = this.publicService.getSetting(SettingTypes.backtest_javascript).pipe(
            this.filterTruth()
        );

        const cache = this.getBacktestResult().pipe(
            map(res => res.httpCache || {}),
            startWith({})
        );

        const task = zip(notify, this.generatePutTaskParams()).pipe(
            map(([_, param]) => param)
        );

        const params = combineLatest(task, blob).pipe(
            withLatestFrom(
                cache,
                (([task, blob], cache) => ({ task, blob, cache }))
            ),
            tap(_ => this.store.dispatch(new Actions.IncreaseBacktestingTaskIndexAction())),
            mergeMap(param => this.computeService.run(param))
        )

        return this.process.processWorkBacktest(this.guardBacktestStart(signal).pipe(
            switchMapTo(params)
        ));
    }

    /**
     * 获取模板的逻辑依赖于当前的选中的模板中是否有源码，如果没有源码，在用户选中模板后去获取源码，不会重复获取。
     */
    launchGetTemplates(): Subscription {
        return this.process.processGetTemplates(
            this.getSelectedTemplates().pipe(
                map(templates => templates.filter(item => !item.source).map(item => item.id)),
                filter(ids => ids.length > 0),
                distinct(),
                map(ids => ({ ids }))
            )
        );
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
        );
    }

    /**
     * 发起对当前回测任务的操作，包括轮询回测的状态，获取回测的结果，停止回测，杀掉回测等。
     * @param command 操作指令，指定操作应该发生的时机。
     * @param taskType 指令的类型
     * @param force 是否强制发起，默认情况下只在回测开关开启时才发起任务。
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

    /**
     * 切换监听服务端回测消息的开关
     * @param start 用户发起的回测信号
     */
    launchUpdateServerMsgSubscribeState(start: Observable<boolean>): Subscription {
        return this.switchReceiveMsgState(start)
            .subscribe(state => this.publicService.updateServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST, state));
    }

    //  =======================================================Data acquisition=======================================================

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

    /**
     * 回测任务是否已全部完成
     */
    isAllTasksCompleted(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectIsAllBacktestTasksCompleted),
        );
    }

    /**
     * 回测任务是否已成功或被强行终止
     */
    isBacktestTerminate(): Observable<boolean> {
        return this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.status).pipe(
            filter(res => !this.error.getBacktestError(res.result)),
            map(res => <fromRes.BacktestResult>JSON.parse((<fromRes.ServerBacktestResult<string>>res.result).Result)),
            map(res => res.TaskStatus !== ServerBacktestTaskStatus.TESTING)
        );
    }

    /**
     * 获取服务端推送的回测结果消息
     */
    getServerSendBacktestMsg(): Observable<fromRes.ServerSendBacktestMessage<fromRes.BacktestResult>> {
        return this.store.pipe(
            select(fromRoot.selectBacktestServerSendMessage),
            this.filterTruth()
        );
    }

    //  =======================================================UI state =======================================================

    /**
     * K line period;
     */
    getSelectedKlinePeriod(): Observable<number> {
        return this.getUIState().pipe(
            map(res => res.timeOptions.klinePeriodId)
        );
    }

    /**
     * Time range;
     */
    getSelectedTimeRange(): Observable<TimeRange> {
        return this.getUIState().pipe(
            map(res => {
                const { start, end } = res.timeOptions;

                return { start, end }; // may be null;
            })
        );
    }

    /**
     * Advance options;
     */
    getAdvancedOptions(): Observable<AdvancedOption> {
        return this.getUIState().pipe(
            map(res => res.advancedOptions),
            distinctUntilChanged(this.compareAllValues())
        );
    }

    /**
     * 获取回测按钮在不同状态下应该显示的文本信息；
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
            map(({ backtestCode, backtestTasks, isOptimizedBacktest }) => isOptimizedBacktest ? !isEmpty(backtestTasks) : true),
            take(1)
        );
    }

    //  =======================================================Local state change=======================================================

    /**
     * @ignore
     */
    updateSelectedTimeRange(range: TimeRange): void {
        this.store.dispatch(new Actions.UpdateSelectedTimeRangeAction(range));
    }

    /**
     * @ignore
     */
    updateSelectedKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateSelectedKlinePeriodAction(id));
    }

    /**
     * @ignore
     */
    updateAdvancedOption(target: AdvancedOptionConfig): void {
        this.store.dispatch(new Actions.UpdateBacktestAdvancedOption({ [target.storageKey]: target.value }));
    }

    /**
     * @ignore
     */
    updateFloorKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateFloorKlinePeriodAction(id));
    }

    /**
     * @ignore
     */
    updatePlatformOptions(source: BacktestSelectedPair[]): void {
        this.store.dispatch(new Actions.UpdateBacktestPlatformOptionAction(source));
    }

    /**
     * @ignore
     */
    updateRunningNode(source: Observable<number>): Subscription {
        return source.subscribe(node => this.store.dispatch(new Actions.UpdateBacktestRunningNodeAction(node)));
    }

    /**
     * @ignore
     */
    toggleBacktestMode(): void {
        this.store.dispatch(new Actions.ToggleBacktestModeAction());
    }

    /**
     * @ignore
     */
    updateBacktestCode(content: BacktestCode): void {
        this.store.dispatch(new Actions.UpdateBacktestCodeAction(content));
    }

    /**
     * @ignore
     */
    updateBacktestArgFilters(source: Filter[]): void {
        this.store.dispatch(new Actions.UpdateBacktestArgFilterAction(source));
    }

    /**
     * @ignore
     */
    updateBacktestLevel(level: number): void {
        this.store.dispatch(new Actions.UpdateBacktestLevelAction(level));
    }

    /**
     * @ignore
     */
    resetBacktestState(): void {
        this.store.dispatch(new Actions.ResetBacktestRelatedStateAction());
    }

    /**
     * 1、停止回测成功后中止接收服务端的推送消息
     * 2、回测任务开始，且不是本地回测时需要接收消息
     * 3、页而销毁时停止接收消息
     * 4、回测任务全部完成时停止接收
     * @param start 用户发起的回测信号
     * @returns 是否监听服务端推送的回测消息
     */
    private switchReceiveMsgState(start: Observable<boolean>): Observable<boolean> {
        return merge(
            this.isLocalBacktest(start).pipe(
                filter(isLocalBacktest => !isLocalBacktest),
                switchMapTo(this.isBacktestArgsValid().pipe(
                    filter(isValid => isValid)
                ))
            ),
            this.isStopSuccess().pipe(
                filter(success => success),
                mapTo(false)
            ),
            this.isAllTasksCompleted().pipe(
                filter(completed => !isNull(completed)),
                map(completed => !completed),
                distinctUntilChanged()
            )
        ).pipe(
            distinctUntilChanged()
        );
    }

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleGetTemplatesError(): Subscription {
        return this.error.handleResponseError(
            this.store.pipe(
                select(fromRoot.selectGetTemplatesResponse),
                this.filterTruth()
            )
        );
    }

    /**
     * @ignore
     */
    handleBacktestIOError(): Subscription {
        return this.error.handleError(
            this.getBacktestIOResponse().pipe(
                map(res => this.error.getBacktestError(res.result))
            )
        );
    }

    /**
     * @ignore
     */
    handleStopBacktestError(): Subscription {
        return this.error.handleError(
            of('STOP_BACKTEST_ERROR'),
            this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.stop).pipe(
                map(res => <string>res.result)
            )
        );
    }
}
