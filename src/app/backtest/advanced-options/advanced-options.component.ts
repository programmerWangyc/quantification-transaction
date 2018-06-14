import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { KLinePeriod } from '../../providers/constant.service';
import { AdvancedOptionConfig, BacktestConstantService, BacktestMode } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-advanced-options',
    templateUrl: './advanced-options.component.html',
    styleUrls: ['./advanced-options.component.scss']
})
export class AdvancedOptionsComponent implements OnInit {

    modes: BacktestMode[];

    selectedMode = 0;

    isAdvancedOptionsOpen = false;

    advancedOptions: Observable<AdvancedOptionConfig[]>;

    periods: KLinePeriod[];

    selectedPeriodId = 3;

    // @Output() updateMode: EventEmitter<number> = new EventEmitter();

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
    ) {

    }

    ngOnInit() {
        this.modes = this.constant.BACKTEST_MODES;

        this.periods = this.constant.K_LINE_PERIOD;

        this.initialModel();
    }

    initialModel() {
        this.advancedOptions = this.backtestService.getAdvancedOptions().map(options => {
            const keys = Object.keys(options);

            return this.constant.ADVANCED_OPTIONS_CONFIG.map(item => {
                const key = keys.find(key => item.storageKey === key);

                item.value = options[key];

                return item;
            })
        });
    }

    changeMode(): void {
        // this.updateMode.next(this.selectedMode);
    }

    changeOption(target: AdvancedOptionConfig): void {
        this.backtestService.updateAdvancedOption(target);
    }

    updatePeriod(id: number): void {
        this.backtestService.updateFloorKlinePeriod(id);
    }

}
