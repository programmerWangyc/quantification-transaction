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
    @Input() set category(value: number) {
        if (value === null) return;

        this._category = value;

        if (value === CategoryType.STOCK_SECURITY) {
            this.fixKlinePeriod(this.constant.K_LINE_PERIOD.find(item => item.minutes === 24 * 60).id);
        } else {
        }
    }

    get category(): number {
        return this._category;
    }

    private _category: number;

    @Input() language: number = 0;

    @Input() backtestConfigInCode: BacktestConfigInCode;

    fixedKlinePeriodId$: Subject<number> = new Subject();

    fixedFloorKlinePeriodId$: Subject<number> = new Subject();

    runningNode$: Subject<number> = new Subject();

    stopBacktest$: Subject<boolean> = new Subject();

    runningNode: Observable<number>;

    strategyArgs: Observable<VariableOverview[]>;

    templates: Observable<TemplateSnapshot[]>;

    backtestBtnText: Observable<string>;

    isBacktestLoading: Observable<boolean>;

    @Output() startBacktest: EventEmitter<boolean> = new EventEmitter();

    disableBacktest: Observable<boolean>;

    strategyId: Observable<number>;

    subscription$$: Subscription;

    isPassedGuard: Observable<boolean>;

    @ViewChild(ExchangeOptionsComponent) exchange: ExchangeOptionsComponent;

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

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

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

    ngOnDestroy() {
        this.isAlive = false;

        this.publicService.updateServerMsgSubscribeState(ServerSendEventType.BACKTEST, false);

        this.backtestService.resetBacktestState();

        this.subscription$$.unsubscribe();
    }
}
