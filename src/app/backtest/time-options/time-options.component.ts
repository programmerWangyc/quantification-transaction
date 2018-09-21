import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { isNull, isNumber } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { KLinePeriod } from '../../providers/constant.service';
import { TipService } from '../../providers/tip.service';
import { TimeRange, BacktestTimeConfig } from '../backtest.interface';
import { BacktestConstantService, BacktestPeriodConfig } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

export type DisabledDateFn = (target: Date) => boolean;

@Component({
    selector: 'app-time-options',
    templateUrl: './time-options.component.html',
    styleUrls: ['./time-options.component.scss'],
})
export class TimeOptionsComponent implements OnInit, OnDestroy {

    @Input() set category(value: number) {
        if (!isNumber(value)) return;

        this.timeConfig = this.constant.getBacktestPeriodTimeConfig(value);

        this.disabledDate = this.disabledDateFactory();

        if (!this._config) {
            this.range = [new Date(this.timeConfig.start), new Date(this.timeConfig.end)];

            this.updateTimeRange();
        }
    }

    @Input() set fixedKlinePeriod(id: number) {
        if (isNumber(id)) {
            this.selectedPeriodId = id;

            this.updatePeriod(id);

            this.disablePeriod = true;
        } else {
            if (!this.freeze) {
                this.disablePeriod && this.tip.messageInfo('RESET_KLINE_PERIOD_OF_TIME_CONFIG');

                this.disablePeriod = false;
            } else {
                isNull(id) && this.tip.messageInfo('RESET_KLINE_PERIOD_OF_TIME_CONFIG');
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

    @Output() timeRangeChange: EventEmitter<TimeRange> = new EventEmitter();

    disablePeriod = false;

    selectedPeriodId: number;

    range: Date[] = [];

    @Input() set config(input: BacktestTimeConfig) {
        if (!input) return;

        const { start, end, klinePeriodId } = input;

        this.range = [start, end];

        this.selectedPeriodId = klinePeriodId;

        this.updateTimeRange();

        this.updatePeriod(klinePeriodId);

        this._config = input;
    }

    private _config: BacktestTimeConfig;

    get config(): BacktestTimeConfig {
        return this._config;
    }

    rangeExtraMsg = 'OUT_OF_TIMELINE';

    periods: KLinePeriod[];

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
        this.backtestService.updateSelectedKlinePeriod(id);
    }

    disabledDateFactory(): DisabledDateFn {
        const { min, max } = this.timeConfig;

        return (target: Date) => {
            return !moment(target).isBetween(new Date(min), new Date(max));
        };
    }

    ngOnDestroy() {
        this.sub$$.unsubscribe();
    }
}
