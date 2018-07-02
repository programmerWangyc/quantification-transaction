import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BacktestConstantService } from '../../backtest/providers/backtest.constant.service';
import { BacktestService } from '../../backtest/providers/backtest.service';
import { BaseComponent } from '../../base/base.component';
import { VariableOverview } from '../../interfaces/app.interface';
import { CategoryType } from '../../interfaces/request.interface';
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

    runningNode: Observable<number>;

    strategyArgs: Observable<VariableOverview[]>;

    templates: Observable<TemplateSnapshot[]>;

    backtestBtnText: Observable<string>;

    isBacktestLoading: Observable<boolean>;

    isFaultTolerantMode: Observable<boolean>;

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

        this.isBacktestLoading = this.backtestService.getUIState()
            .pipe(
                map(state => state.isBacktesting)
            );

        this.runningNode = this.backtestService.getRunningNode();

        this.isFaultTolerantMode = this.backtestService.getUIState()
            .pipe(
                map(state => state.isFaultTolerantMode)
            );

        this.disableBacktest = this.backtestService.getUIState()
            .pipe(
                map(res => !res.platformOptions || !res.platformOptions.length || res.isBacktesting)
            );
    }

    launch() {

        // 打开订阅回测消息的开关。
        this.publicService.updateServerMsgSubscribeState(ServerSendEventType.BACKTEST, true);

        this.subscription$$ = this.backtestService.handleGetTemplatesError()
            .add(this.backtestService.handleBacktestIOError())
            .add(this.backtestService.launchGetTemplates())
            .add(this.backtestService.updateRunningNode(this.runningNode$))
            .add(this.backtestService.launchBacktest(this.startBacktest$))
    }

    toggleBacktestMode() {
        this.backtestService.toggleBacktestMode();
    }

    stopBacktest() {

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
