import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { isNull, isNumber } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

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

    /**
     * Category of current strategy;
     */
    @Input() set category(value: number) {
        if (!isNumber(value)) return;

        this._category = value;

        this.timeConfig = this.constant.getBacktestPeriodTimeConfig(value);

        this.disabledDate = this.disabledDateFactory();

        this.range = [new Date(this.timeConfig.start), new Date(this.timeConfig.end)];

        this.updateTimeRange();
    }

    /**
     * 将k线周期设置为固定值
     */
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
     * Output time range;
     */
    @Output() timeRangeChange: EventEmitter<TimeRange> = new EventEmitter();

    /**
     * Output k line period if changed;
     */
    @Output() klineChange: EventEmitter<number> = new EventEmitter();

    /**
     * Disable k line period;
     */
    disablePeriod = false;

    /**
     * @ignore
     */
    selectedPeriodId: number;

    /**
     * Time range;
     */
    range: Date[] = [];

    /**
     * @ignore
     */
    rangeExtraMsg = 'OUT_OF_TIMELINE';

    /**
     * K line period list;
     */
    periods: KLinePeriod[];

    /**
     * @ignore
     */
    private _category: number;

    /**
     * Function used for time range component used to forbidden selected some days;
     */
    disabledDate: DisabledDateFn;

    /**
     * Backtest period config;
     */
    timeConfig: BacktestPeriodConfig;

    /**
     * @ignore
     */
    sub$$: Subscription;

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
        private tip: TipService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.periods = this.constant.K_LINE_PERIOD;

        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    launch() {
        this.sub$$ = this.backtestService.getSelectedKlinePeriod().subscribe(id => this.selectedPeriodId = id);
    }

    /**
     * @ignore
     */
    initialModel() {

    }

    /**
     * Emit time range;
     */
    emit() {
        const [start, end] = this.range;

        this.timeRangeChange.emit({ start, end });

        this.updateTimeRange();
    }

    /**
     * Update time range value in store;
     */
    updateTimeRange(): void {
        const [start, end] = this.range;

        this.backtestService.updateSelectedTimeRange({ start, end });
    }

    /**
     * Update k line period in store;
     * @param id k line period id;
     */
    updatePeriod(id: number): void {
        this.klineChange.next(id);

        this.backtestService.updateSelectedKlinePeriod(id);
    }

    /**
     * Factory function for generate disableDate function;
     */
    disabledDateFactory(): DisabledDateFn {
        const { min, max } = this.timeConfig;

        return (target: Date) => {
            return !moment(target).isBetween(new Date(min), new Date(max));
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.sub$$.unsubscribe();
    }
}
