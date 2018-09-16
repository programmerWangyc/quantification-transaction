import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMapTo, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { VariableOverview } from '../../interfaces/app.interface';
import { BacktestIOType, CategoryType } from '../../interfaces/request.interface';
import { ServerSendEventType, TemplateSnapshot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { BacktestConfigInCode } from '../backtest.interface';
import { ExchangeOptionsComponent } from '../exchange-options/exchange-options.component';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-simulation',
    templateUrl: './backtest-simulation.component.html',
    styleUrls: ['./backtest-simulation.component.scss'],
})
export class BacktestSimulationComponent extends BaseComponent {
    /**
     * Category of current strategy. As soon as it is changed, we need to check k line period.
     */
    @Input() set category(value: number) {
        if (value === null) return;

        this._category = value;

        if (value === CategoryType.STOCK_SECURITY) {
            this.fixKlinePeriod(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id);
        } else {
            // 暂时关了， 搞不清这个逻辑是从原来项目的哪个地方业的了
            // this.fixKlinePeriod(this.constant.K_LINE_PERIOD.find(item => item.minutes === 15).id, this.constant.K_LINE_PERIOD.find(item => item.minutes === 5).id);
        }
    }

    /**
     * @ignore
     */
    get category(): number {
        return this._category;
    }

    /**
     * @ignore
     */
    private _category: number;

    /**
     * Programing language of current strategy.
     */
    @Input() language: number = 0;

    /**
     * backtest config in code;
     */
    @Input() backtestConfigInCode: BacktestConfigInCode;

    /**
     * ! FIXME 直接把 subject 输入了子组件
     * K line period value;
     */
    fixedKlinePeriodId$: Subject<number> = new Subject();

    /**
     * ! FIXME 直接把 subject 输入了子组件
     * Floor k line period value;
     */
    fixedFloorKlinePeriodId$: Subject<number> = new Subject();

    /**
     * If the language of the strategy is 'python', we must set a running node.
     */
    runningNode$: Subject<number> = new Subject();

    /**
     * Command to stop backtest.
     */
    stopBacktest$: Subject<boolean> = new Subject();

    /**
     * !FIXME: Command to stop backtest;
     */
    runningNode: Observable<number>;

    /**
     * Strategy arguments;
     */
    strategyArgs: Observable<VariableOverview[]>;

    /**
     * Templates that the strategy dependance.
     */
    templates: Observable<TemplateSnapshot[]>;

    /**
     * Text of the backtest button during different backtest phase;
     */
    backtestBtnText: Observable<string>;

    /**
     * Whether is backtesting;
     */
    isBacktestLoading: Observable<boolean>;

    /**
     * Start backtest signal;
     */
    @Output() startBacktest: EventEmitter<boolean> = new EventEmitter();

    /**
     * Whether to disable the backtest button.
     */
    disableBacktest: Observable<boolean>;

    /**
     * @ignore
     */
    strategyId: Observable<number>;

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * Whether the start signal had passed guard audit.Backtest launched only after guard audit.
     */
    isPassedGuard: Observable<boolean>;

    /**
     * @ignore
     */
    @ViewChild(ExchangeOptionsComponent) exchange: ExchangeOptionsComponent;

    /**
     * 强制锁定周期；
     * 用户切换策略的category后，如果platform是 'Futures_CTP'；此时强制锁定k线周期
     */
    forceFreeze = false;

    isAlive = true;

    constructor(
        private backtestService: BacktestService,
        private constant: BacktestConstantService,
        private route: ActivatedRoute,
        private publicService: PublicService,
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
        this.strategyId = this.route.paramMap.pipe(
            map(param => +param.get('id'))
        );

        this.strategyArgs = this.backtestService.getExistedStrategyArgs(() => true).pipe(
            startWith([]),
            map(args => args.filter(arg => !this.backtestService.isCommandArg()(arg.variableName)))
        );

        this.templates = this.backtestService.getSelectedTemplates();

        this.backtestBtnText = this.backtestService.getBacktestBtnText();

        this.isBacktestLoading = this.backtestService.isBacktesting();

        this.runningNode = this.backtestService.getRunningNode();

        this.disableBacktest = this.backtestService.getUIState().pipe(
            map(res => res.isForbiddenBacktest)
        );

        this.isPassedGuard = this.startBacktest.pipe(
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
            .add(this.backtestService.updateRunningNode(this.runningNode$.asObservable()))
            .add(this.backtestService.launchOperateBacktest(this.stopBacktest$.asObservable(), BacktestIOType.stopTask, true))
            .add(this.backtestService.stopRunWorker(this.stopBacktest$.asObservable()))
            .add(this.backtestService.launchUpdateServerMsgSubscribeState(this.startBacktest.asObservable()));

        const keepAlive = () => this.isAlive;

        this.backtestService.launchBacktest(this.startBacktest.asObservable().pipe(
            takeWhile(keepAlive)
        ), keepAlive);
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

    /**
     * 监听 exchange option component 发送上来的 k 线周期Id。
     * @param id k线周期 Id
     */
    onExchange(id: number): void {
        this.forceFreeze = false;

        this.fixedKlinePeriodId$.next(id);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.publicService.updateServerMsgSubscribeState(ServerSendEventType.BACKTEST, false);

        this.backtestService.resetBacktestState();

        this.subscription$$.unsubscribe();
    }
}
