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
    styleUrls: ['./advanced-options.component.scss']
})
export class AdvancedOptionsComponent implements OnInit, OnDestroy {
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

    @Input() set freeze(value: boolean) {
        this.disablePeriod = value;

        this._freeze = value;
    }

    private _freeze = false;

    get freeze(): boolean {
        return this._freeze;
    }

    disablePeriod = false;

    modes: BacktestMode[];

    selectedMode = 0;

    isFaultTolerantMode: Observable<boolean>;

    isAdvancedOptionsOpen = false;

    advancedOptions: Observable<AdvancedOptionConfig[]>;

    periods: KLinePeriod[];

    selectedPeriodId = 2;

    isHelpShow = true;

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
                    const key = keys.find(key => item.storageKey === key);

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
