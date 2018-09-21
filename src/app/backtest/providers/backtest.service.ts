import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { isEmpty, isNull, isNumber } from 'lodash';
import { combineLatest, concat, interval, merge, never, Observable, of, Subscription, zip } from 'rxjs';
import {
    distinct, distinctUntilChanged, filter, map, mapTo, mergeMap, mergeMapTo, partition, skip, startWith, switchMap,
    switchMapTo, take, takeUntil, takeWhile, tap, withLatestFrom
} from 'rxjs/operators';

import { keepAliveFn, VariableOverview } from '../../interfaces/app.interface';
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
    ) {
        super(store, constant);
    }


    launchBacktest(start: Observable<boolean>, keepAlive: keepAliveFn): Subscription[] {
        const [atLocal, atServer] = partition((isLocal: boolean) => isLocal)(this.isLocalBacktest(start));

        const server$$ = this.startServerBacktest(atServer, keepAlive);

        const local$$ = this.startLocalBacktest(atLocal, keepAlive);

        const generateToBeTestedValue$$ = start.subscribe(_ => this.store.dispatch(new Actions.GenerateToBeTestedValuesAction()));

        return [generateToBeTestedValue$$, local$$, server$$];
    }

    private startServerBacktest(start: Observable<boolean>, keepAlive: keepAliveFn): Subscription {
        return this.launchOperateBacktest(
            this.getServerSendBacktestMsg().pipe(
                takeWhile(keepAlive)
            ),
            BacktestIOType.getTaskResult
        )
            .add(this.launchOperateBacktest(
                this.pollingBacktestStatus(start),
                BacktestIOType.getTaskStatus
            ))

            .add(this.launchOperateBacktest(
                this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result).pipe(
                    filter(res => !this.error.getBacktestError(res.result))
                ),
                BacktestIOType.deleteTask
            ))

            .add(this.launchServerBacktest(this.guardBacktestStart(start)));
    }

    private pollingBacktestStatus(start: Observable<boolean>): Observable<boolean> {

        const pollingStart = this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.backtest).pipe(
            filter(res => !this.error.getBacktestError(res.result)),
            mergeMapTo(interval(2000).pipe(
                mapTo(true),
                takeUntil(merge(this.getServerSendBacktestMsg(), this.isBacktestTerminate()))
            ))
        );

        const pollingEnd = this.store.pipe(
            this.selectTruth(fromRoot.selectIsAllBacktestResultReceived)
        );

        return start.pipe( switchMapTo( pollingStart.pipe( takeUntil(pollingEnd))));
    }

    private launchServerBacktest(signal: Observable<boolean>): Subscription {
        const notify = concat( of(true), this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result).pipe( withLatestFrom(this.publicService.getServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST)), filter(([_, onOff]) => onOff), mapTo(true)));
        return this.process.processBacktestIO(signal.pipe(switchMapTo(zip(this.getPutTaskParameters(), notify).pipe(map(([params, _]) => params), takeUntil(this.getUIState().pipe(map(state => state.backtestMilestone), skip(1), filter(milestone => isNull(milestone))))))));
    }

    private startLocalBacktest(signal: Observable<boolean>, keepAlive: keepAliveFn): Subscription {
        const notify = concat(
            of(true),
            this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.result),
        );

        const blobObs = this.publicService.getSetting(SettingTypes.backtest_javascript).pipe(
            this.filterTruth(),
        );

        const cacheObs = this.getBacktestResult().pipe(
            map(res => res.httpCache || {}),
            startWith({})
        );

        const taskObs = zip(notify, this.generatePutTaskParams()).pipe(
            map(([_, param]) => param)
        );

        const params = combineLatest(taskObs, blobObs).pipe(
            withLatestFrom(
                cacheObs,
                (([task, blob], cache) => ({ task, blob, cache }))
            ),
            tap(_ => this.store.dispatch(new Actions.IncreaseBacktestingTaskIndexAction())),
            mergeMap(param => this.computeService.run(param))
        );

        return this.process.processWorkBacktest(this.guardBacktestStart(signal).pipe(
            takeWhile(keepAlive),
            switchMapTo(params)
        ));
    }

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

    launchOperateBacktest(command: Observable<any>, taskType: string, force: boolean = false): Subscription {
        const task = this.getBacktestTaskParams(taskType).pipe(
            take(1)
        );

        const serverMsgSubscribeState = this.publicService.getServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST);

        return this.process.processBacktestIO(
            command.pipe(
                switchMapTo(
                    force ? task : task.pipe(
                        withLatestFrom(serverMsgSubscribeState),
                        filter(([_, onOff]) => onOff),
                        map(([params, _]) => params)
                    )
                )
            )
        );
    }

    private guardBacktestStart(wantStart: Observable<boolean>): Observable<boolean> {
        return wantStart.pipe(
            switchMapTo(this.isBacktestArgsValid().pipe(
                tap(isValid => !isValid && this.tipService.messageError('COMBINATION_ARGS_EMPTY_ERROR')),
                switchMap(isValid => isValid ? of(true) : never()),
                tap(_ => this.store.dispatch(new Actions.OpenBacktestLoadingStateAction()))
            ))
        );
    }

    stopRunWorker(command: Observable<any>): Subscription {
        return this.computeService.stopRun(command);
    }

    launchUpdateServerMsgSubscribeState(start: Observable<boolean>): Subscription {
        return this.switchReceiveMsgState(start)
            .subscribe(state => this.publicService.updateServerMsgSubscribeState(fromRes.ServerSendEventType.BACKTEST, state));
    }

    isLocalBacktest(start: Observable<boolean>): Observable<boolean> {
        const result = zip(
            this.store.pipe(
                select(fromRoot.selectStrategyUIState),
                map(state => state.selectedLanguage === Language.JavaScript)
            ),
            this.getStrategyDetailResponse().pipe(
                map(res => !res || res.result.strategy.is_owner)
            )
        ).pipe(
            map(([isJS, isOwner]) => isJS && isOwner),
            take(1)
        );

        return start.pipe(
            switchMapTo(result)
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

    private getUUid(): Observable<string> {
        return this.filterPutTaskSuccessfulResponse().pipe(
            map(res => res.Result),
            distinctUntilChanged()
        );
    }

    isStopSuccess(): Observable<boolean> {
        return this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.stop).pipe(
            map(res => !isStopBacktestFail(res))
        );
    }

    isAllTasksCompleted(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectIsAllBacktestTasksCompleted),
        );
    }

    isBacktestTerminate(): Observable<boolean> {
        return this.getBacktestIOResponse(Actions.BacktestOperateCallbackId.status).pipe(
            filter(res => !this.error.getBacktestError(res.result)),
            map(res => <fromRes.BacktestResult>JSON.parse((<fromRes.ServerBacktestResult<string>>res.result).Result)),
            map(res => res.TaskStatus !== ServerBacktestTaskStatus.TESTING)
        );
    }

    getServerSendBacktestMsg(): Observable<fromRes.ServerSendBacktestMessage<fromRes.BacktestResult>> {
        return this.store.pipe(
            select(fromRoot.selectBacktestServerSendMessage),
            this.filterTruth()
        );
    }

    getExistedStrategyArgs(predicate: (s: string) => boolean): Observable<VariableOverview[]> {
        return this.getStrategyDetail().pipe(
            map(detail => detail.semanticArgs.filter(arg => predicate(arg.variableName)))
        );
    }

    isCommandArg() {
        return this.constant.isSpecialTypeArg(this.constant.COMMAND_PREFIX);
    }

    getSelectedKlinePeriod(): Observable<number> {
        return this.getUIState().pipe(
            map(res => res.timeOptions.klinePeriodId)
        );
    }

    getSelectedTimeRange(): Observable<TimeRange> {
        return this.getUIState().pipe(
            map(res => {
                const { start, end } = res.timeOptions;

                return { start, end };
            })
        );
    }

    getAdvancedOptions(): Observable<AdvancedOption> {
        return this.getUIState().pipe(
            map(res => res.advancedOptions),
            distinctUntilChanged(this.compareAllValues())
        );
    }

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

    isBacktesting(): Observable<boolean> {
        return this.getUIState().pipe(
            map(state => state.isBacktesting)
        );
    }

    isBacktestArgsValid(): Observable<boolean> {
        return this.getUIState().pipe(
            filter(({ backtestCode, backtestTasks }) => !!backtestCode && !!backtestTasks),
            map(({ backtestTasks, isOptimizedBacktest }) => isOptimizedBacktest ? !isEmpty(backtestTasks) : true),
            take(1)
        );
    }

    updateSelectedTimeRange(range: TimeRange): void {
        this.store.dispatch(new Actions.UpdateSelectedTimeRangeAction(range));
    }

    updateSelectedKlinePeriod(id: number): void {
        this.store.dispatch(new Actions.UpdateSelectedKlinePeriodAction(id));

        this.updateFloorKlinePeriod(this.getFloorKlinePeriodIdByKlinePeriodId(id));
    }

    private getFloorKlinePeriodIdByKlinePeriodId(id: number): number {
        const index = this.constant.K_LINE_PERIOD.findIndex(item => item.id === id);

        if (index < 3) {
            return this.constant.K_LINE_PERIOD[0].id;
        } else {
            return this.constant.K_LINE_PERIOD[index - 1].id;
        }
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

    handleGetTemplatesError(): Subscription {
        return this.error.handleResponseError(
            this.store.pipe(
                select(fromRoot.selectGetTemplatesResponse),
                this.filterTruth()
            )
        );
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
