import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { isNumber } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { KLinePeriod } from '../../providers/constant.service';
import { TipService } from '../../providers/tip.service';
import { TimeRange } from '../backtest.interface';
import { BacktestConstantService, BacktestPeriodConfig } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

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

        this._category = value;

        this.timeConfig = this.constant.getBackTestPeriodTimeConfig(value);

        this.disabledDate = this.disabledDateFactory();

        this.range = [new Date(this.timeConfig.start), new Date(this.timeConfig.end)];

        this.updateTimeRange();
    }

    @Input() set fixedKlinePeriod(id: number) {
        if (isNumber(id)) {
            this.selectedPeriodId = id;

            this.updatePeriod(id);

            this.disablePeriod = true;
        } else {
            this.disablePeriod && this.tip.messageInfo('RESET_KLINE_PERIOD_OF_TIME_CONFIG');

            this.disablePeriod = false;
        }
    }

    @Output() timeRangeChange: EventEmitter<TimeRange> = new EventEmitter();

    @Output() klineChange: EventEmitter<number> = new EventEmitter();

    disablePeriod = false;

    selectedPeriodId: number;

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

        this.timeRangeChange.emit({ start, end });

        this.updateTimeRange();
    }

    updateTimeRange(): void {
        const [start, end] = this.range;

        this.backtestService.updateSelectedTimeRange({ start, end });
    }

    updatePeriod(id: number): void {
        this.klineChange.next(id);

        this.backtestService.updateSelectedKlinePeriod(id);
    }

    disabledDateFactory(): DisabledDateFn {
        const { min, max } = this.timeConfig;

        return (target: Date) => {
            return !moment(target).isBetween(new Date(min), new Date(max));
        }
    }

    ngOnDestroy() {
        this.sub$$.unsubscribe();
    }
}
