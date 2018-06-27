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
            this.disablePeriod = false;
        }
    }

    modes: BacktestMode[];

    selectedMode = 0;

    isAdvancedOptionsOpen = false;

    advancedOptions: Observable<AdvancedOptionConfig[]>;

    periods: KLinePeriod[];

    disablePeriod = false;

    selectedPeriodId = 3;

    isHelpShow = true;

    subscription: Subscription;

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
    ) {

    }

    ngOnInit() {
        this.modes = this.constant.BACKTEST_MODES;

        this.periods = this.constant.K_LINE_PERIOD;

        this.initialModel();

        this.subscription = this.backtestService.getUIState()
            .pipe(
                map(state => state.backtestLevel)
            )
            .subscribe(level => this.selectedMode = level);
    }

    initialModel() {
        this.advancedOptions = this.backtestService.getAdvancedOptions()
            .pipe(
                map(options => {
                    const keys = Object.keys(options);

                    return this.constant.ADVANCED_OPTIONS_CONFIG.map(item => {
                        const key = keys.find(key => item.storageKey === key);

                        item.value = options[key];

                        return item;
                    })
                })
            );
    }

    updateMode(mode: number): void {
        this.backtestService.updateBacktestLevel(mode);
    }

    changeOption(target: AdvancedOptionConfig): void {
        this.backtestService.updateAdvancedOption(target);
    }

    updatePeriod(id: number): void {
        this.backtestService.updateFloorKlinePeriod(id);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
