import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { isNumber } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { KLinePeriod } from '../../providers/constant.service';
import { TipService } from '../../providers/tip.service';
import { BacktestConstantService, BacktestPeriodConfig } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

export interface BacktestTimeConfig {
    start: Date;
    end: Date;
    klinePeriodId: number;
}

export interface DisabledDateFn {
    (target: Date): boolean;
}

@Component({
    selector: 'app-time-options',
    templateUrl: './time-options.component.html',
    styleUrls: ['./time-options.component.scss']
})
export class TimeOptionsComponent implements OnInit, OnDestroy {

    @Input() set category(value: number) {
        if (!isNumber(value)) return;

        this.timeConfig = this.constant.getBackTestPeriodTimeConfig(value);

        this.disabledDate = this.disabledDateFactory();

        this.initRange();
    }

    @Output() change: EventEmitter<BacktestTimeConfig> = new EventEmitter();

    @Input() set fixedKlinePeriod(id: number) {
        if (isNumber(id)) {
            this.selectedPeriodId = id;

            this.updatePeriod();

            this.canSelectPeriod = true;
        } else {
            this.canSelectPeriod && this.tip.messageInfo('RESET_KLINE_PERIOD_OF_TIME_CONFIG');

            this.canSelectPeriod = false;
        }
    }

    canSelectPeriod = false;

    selectedPeriodId = 3; // 15 minutes;

    range: Date[] = [];

    rangeExtraMsg = 'OUT_OF_TIMELINE';

    periods: KLinePeriod[];

    private _category: number;

    disabledDate: DisabledDateFn;

    timeConfig: BacktestPeriodConfig;

    sub$$: Subscription;

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
        private tip: TipService,
    ) { }

    ngOnInit() {
        this.periods = this.constant.K_LINE_PERIOD;

        this.initialModel();

        this.launch();
    }

    launch() {
        this.sub$$ = this.backtestService.getSelectedKlinePeriod().subscribe(id => this.selectedPeriodId = id);
    }

    initialModel() {

    }

    emit() {
        const [start, end] = this.range;

        this.change.emit({ start, end, klinePeriodId: this.selectedPeriodId });
    }

    updatePeriod() {
        this.emit();

        this.backtestService.updateSelectedKlinePeriod(this.selectedPeriodId);
    }

    disabledDateFactory(): DisabledDateFn {
        const { min, max } = this.timeConfig;

        return (target: Date) => {
            return !moment(target).isBetween(new Date(min), new Date(max));
        }
    }

    initRange(): void {
        const { start, end } = this.timeConfig;

        this.range = [new Date(start), new Date(end)];
    }

    ngOnDestroy() {
        this.sub$$.unsubscribe();
    }
}
