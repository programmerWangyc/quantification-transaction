import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { isNumber } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { KLinePeriod } from '../../providers/constant.service';
import { AdvancedOptionConfig, BacktestConstantService, BacktestMode } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-advanced-options',
    templateUrl: './advanced-options.component.html',
    styleUrls: ['./advanced-options.component.scss'],
})
export class AdvancedOptionsComponent implements OnInit, OnDestroy {
    /**
     * 将k线周期设置为固定值
     */
    @Input() set fixedKlinePeriod(value: number) {
        if (isNumber(value)) {
            this.selectedPeriodId = value;

            this.disablePeriod = true;

            this.updatePeriod(value);
        } else {
            if (!this.freeze) {
                this.disablePeriod = false;
            }
        }
    }

    /**
     * 冻结 k 线周期的设置
     */
    @Input() set freeze(value: boolean) {
        this.disablePeriod = value;

        this._freeze = value;
    }

    /**
     * @ignore
     */
    private _freeze = false;

    /**
     * Whether the k line period is freezed;
     */
    get freeze(): boolean {
        return this._freeze;
    }

    /**
     * Disabled k line period setting;
     */
    disablePeriod = false;

    /**
     * Backtest mode. Real or simulate;
     */
    modes: BacktestMode[];

    /**
     * Selected backtest mode;
     */
    selectedMode = 0;

    /**
     * Whether backtest will run in fault mode;
     */
    isFaultTolerantMode: Observable<boolean>;

    /**
     * Toggle hide and show advance options;
     */
    isAdvancedOptionsOpen = false;

    /**
     * All config of advance options.
     */
    advancedOptions: Observable<AdvancedOptionConfig[]>;

    /**
     * Floor k line period;
     */
    periods: KLinePeriod[];

    /**
     * Selected floor k line period id;
     */
    selectedPeriodId = 2;

    /**
     * Whether show tip for config option if has.
     */
    isHelpShow = true;

    /**
     * @ignore
     */
    subscription: Subscription;

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
    ) {

    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.modes = this.constant.BACKTEST_MODES;

        this.periods = this.constant.K_LINE_PERIOD;

        this.initialModel();

        this.subscription = this.backtestService.getUIState()
            .subscribe(state => {
                const { floorKlinePeriod, backtestLevel } = state;

                this.selectedMode = backtestLevel;

                this.selectedPeriodId = floorKlinePeriod;
            });
    }

    /**
     * @ignore
     */
    initialModel() {
        this.advancedOptions = this.backtestService.getAdvancedOptions().pipe(
            map(options => {
                const keys = Object.keys(options);

                return this.constant.ADVANCED_OPTIONS_CONFIG.map(item => {
                    const key = keys.find(k => item.storageKey === k);

                    item.value = options[key];

                    return item;
                });
            })
        );

        this.isFaultTolerantMode = this.backtestService.getUIState().pipe(
            map(state => state.isFaultTolerantMode)
        );
    }

    /**
     * Update backtest mode level, simulation or real
     */
    updateMode(mode: number): void {
        this.backtestService.updateBacktestLevel(mode);
    }

    /**
     * Update advance option.
     */
    changeOption(target: AdvancedOptionConfig): void {
        this.backtestService.updateAdvancedOption(target);
    }

    /**
     * Switch backtest mode, run backtest at fault tolerant mode or not;
     */
    toggleBacktestMode() {
        this.backtestService.toggleBacktestMode();
    }

    /**
     * Update floor kline period.
     */
    updatePeriod(id: number): void {
        this.backtestService.updateFloorKlinePeriod(id);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
