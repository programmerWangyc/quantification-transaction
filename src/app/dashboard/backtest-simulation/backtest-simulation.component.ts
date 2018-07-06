import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, mapTo, startWith } from 'rxjs/operators';

import { BacktestConstantService } from '../../backtest/providers/backtest.constant.service';
import { BacktestService } from '../../backtest/providers/backtest.service';
import { BaseComponent } from '../../base/base.component';
import { VariableOverview } from '../../interfaces/app.interface';
import { BacktestIOType, CategoryType } from '../../interfaces/request.interface';
import { ServerSendEventType, TemplateSnapshot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { StrategyService } from '../../strategy/providers/strategy.service';

@Component({
    selector: 'app-backtest-simulation',
    templateUrl: './backtest-simulation.component.html',
    styleUrls: ['./backtest-simulation.component.scss']
})
export class BacktestSimulationComponent extends BaseComponent {
    @Input() set category(value: number) {
        if (value === null) return;

        this._category = value;

        value === CategoryType.STOCK_SECURITY && this.fixKlinePeriod(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id)
    }

    get category(): number {
        return this._category;
    }

    private _category: number;

    @Input() language: number = 0;

    fixedKlinePeriodId$: Subject<number> = new Subject();

    fixedFloorKlinePeriodId$: Subject<number> = new Subject();

    runningNode$: Subject<number> = new Subject();

    stopBacktest$: Subject<boolean> = new Subject();

    runningNode: Observable<number>;

    strategyArgs: Observable<VariableOverview[]>;

    templates: Observable<TemplateSnapshot[]>;

    backtestBtnText: Observable<string>;

    isBacktestLoading: Observable<boolean>;


    startBacktest$: Subject<boolean> = new Subject();

    disableBacktest: Observable<boolean>;

    strategyId: Observable<number>;

    subscription$$: Subscription;

    constructor(
        private strategyService: StrategyService,
        private backtestService: BacktestService,
        private constant: BacktestConstantService,
        private route: ActivatedRoute,
        private publicService: PublicService,
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.strategyId = this.route.paramMap
            .pipe(
                map(param => +param.get('id'))
            );

        this.strategyArgs = this.strategyService.getExistedStrategyArgs(() => true)
            .pipe(
                startWith([]),
                map(args => args.filter(arg => !this.strategyService.isCommandArg(arg.variableName)))
            );

        this.templates = this.backtestService.getSelectedTemplates();

        this.backtestBtnText = this.backtestService.getBacktestBtnText();

        this.isBacktestLoading = this.backtestService.isBacktesting();

        this.runningNode = this.backtestService.getRunningNode();

        this.disableBacktest = this.backtestService.getUIState()
            .pipe(
                map(res => res.isForbiddenBacktest)
            );
    }

    launch() {
        this.subscription$$ = this.backtestService.handleGetTemplatesError()
            .add(this.backtestService.handleBacktestIOError())
            .add(this.backtestService.launchGetTemplates())
            .add(this.backtestService.updateRunningNode(this.runningNode$))
            .add(this.backtestService.launchBacktest(this.startBacktest$))
            .add(this.backtestService.launchOperateBacktest(this.stopBacktest$, BacktestIOType.stopTask, true))
            .add(this.switchReceiveMsgState().subscribe(state => this.publicService.updateServerMsgSubscribeState(ServerSendEventType.BACKTEST, state)))
    }

    /**
     * @description 1、停止回测成功后中止接收服务端的推送消息。2、回测任务开始时将开始需要接收消息 3、页而销毁时停止接收消息
     */
    private switchReceiveMsgState(): Observable<boolean> {
        return merge(
            this.startBacktest$.pipe(
                mapTo(true)
            ),
            this.backtestService.isStopSuccess().pipe(
                filter(success => success),
                mapTo(false)
            )
        );
    }

    private fixKlinePeriod(klinePeriodId: number): void {
        this.fixedKlinePeriodId$.next(klinePeriodId);

        this.fixedFloorKlinePeriodId$.next(klinePeriodId);
    }

    ngOnDestroy() {
        this.publicService.updateServerMsgSubscribeState(ServerSendEventType.BACKTEST, false);

        this.backtestService.resetBacktestState();

        this.subscription$$.unsubscribe();
    }
}
