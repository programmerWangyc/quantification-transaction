import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMapTo } from 'rxjs/operators';

import { ExchangeOptionsComponent } from '../../backtest/exchange-options/exchange-options.component';
import { BacktestConstantService } from '../../backtest/providers/backtest.constant.service';
import { BacktestService } from '../../backtest/providers/backtest.service';
import { BaseComponent } from '../../base/base.component';
import { VariableOverview } from '../../interfaces/app.interface';
import { BacktestIOType, CategoryType } from '../../interfaces/request.interface';
import { ServerSendEventType, TemplateSnapshot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
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

        if (value === CategoryType.STOCK_SECURITY) {
            this.fixKlinePeriod(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id);
        } else {
            this.fixKlinePeriod(this.constant.K_LINE_PERIOD.find(item => item.minutes === 15).id, this.constant.K_LINE_PERIOD.find(item => item.minutes === 5).id);
        }
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

    isPassedGuard: Observable<boolean>;

    @ViewChild(ExchangeOptionsComponent) exchange: ExchangeOptionsComponent;

    /**
     * 强制锁定周期；
     * 用户切换策略的category后，如果platform是 'Futures_CTP'；此时强制锁定k线周期
     */
    forceFreeze = false;

    constructor(
        private strategyService: StrategyService,
        private backtestService: BacktestService,
        private constant: BacktestConstantService,
        private route: ActivatedRoute,
        private publicService: PublicService,
        private tip: TipService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
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

        this.disableBacktest = this.backtestService.getUIState().pipe(
            map(res => res.isForbiddenBacktest)
        );

        this.isPassedGuard = this.startBacktest$.pipe(
            switchMapTo(this.backtestService.isBacktestArgsValid())
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.backtestService.handleGetTemplatesError()
            .add(this.backtestService.handleBacktestIOError())
            .add(this.backtestService.launchGetTemplates())
            .add(this.backtestService.updateRunningNode(this.runningNode$))
            .add(this.backtestService.launchBacktest(this.startBacktest$))
            .add(this.backtestService.launchOperateBacktest(this.stopBacktest$, BacktestIOType.stopTask, true))
            .add(this.backtestService.stopRunWorker(this.stopBacktest$))
            .add(this.backtestService.launchUpdateServerMsgSubscribeState(this.startBacktest$))
    }

    /**
     * 修正 k 线周期，底层 k 线周期。
     * @param klinePeriodId k线周期 Id
     * @param floorKLinePeriod 底层 k 线周期的 Id；未传时将使用 k 线周期；
     */
    private fixKlinePeriod(klinePeriodId: number, floorKLinePeriod?: number): void {

        if (this.exchange.selectedPlatform === 'Futures_CTP') {
            this.forceFreeze = true;

            this.fixedKlinePeriodId$.next(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id);

        } else {
            this.forceFreeze = false;

            this.fixedKlinePeriodId$.next(klinePeriodId);
        }

        if (floorKLinePeriod) {
            this.fixedFloorKlinePeriodId$.next(floorKLinePeriod);
        } else {
            this.fixedFloorKlinePeriodId$.next(klinePeriodId);
        }
    }

    onExchange(id: number): void {
        this.forceFreeze = false;

        this.fixedKlinePeriodId$.next(id);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.publicService.updateServerMsgSubscribeState(ServerSendEventType.BACKTEST, false);

        this.backtestService.resetBacktestState();

        this.subscription$$.unsubscribe();
    }
}
