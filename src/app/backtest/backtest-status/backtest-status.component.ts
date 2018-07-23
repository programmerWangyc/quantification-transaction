import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, startWith } from 'rxjs/operators';

import { BacktestStatistic } from '../backtest.config';
import { BacktestChartService } from '../providers/backtest.chart.service';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-status',
    templateUrl: './backtest-status.component.html',
    styleUrls: ['./backtest-status.component.scss']
})
export class BacktestStatusComponent implements OnInit {

    /**
     * The index of the processing task.
     */
    processingTaskIndex: Observable<number>;

    /**
     * @ignore
     */
    loadBytes: Observable<number>;

    /**
     * @ignore
     */
    logTotal: Observable<number>;

    /**
     * Backtest progress;
     */
    progress: Observable<number>;

    /**
     * Backtest profit
     */
    profit: Observable<number>;

    /**
     * Backtest status, completed or running;
     */
    status: Observable<string>;

    /**
     * Total task amount;
     */
    tasks: Observable<number>;

    /**
     * Backtest time consuming;
     */
    timeConsuming: Observable<number>;

    /**
     * Trade counts;
     */
    transactions: Observable<number>;

    constructor(
        private backtestService: BacktestService,
        private constant: BacktestConstantService,
        private chartService: BacktestChartService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {

        this.processingTaskIndex = this.chartService.getIndexOfBacktestingTask();

        this.loadBytes = this.chartService.getBacktestStatistics(BacktestStatistic.LoadBytes);

        this.logTotal = this.chartService.getBacktestStatistics(BacktestStatistic.LogsCount);

        this.progress = this.chartService.getBacktestProgress().pipe(
            startWith(0)
        );

        this.profit = this.chartService.getBacktestStatistics(BacktestStatistic.Profit);

        this.status = this.backtestService.isBacktesting().pipe(
            map(isLoading => isLoading ? 'RUNNING' : 'COMPLETE')
        );

        this.tasks = this.backtestService.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            map(state => state.backtestTasks.length || 1)
        );

        this.timeConsuming = this.chartService.getBacktestStatistics(BacktestStatistic.Elapsed).pipe(
            map(data => data / this.constant.BACKTEST_RESULT_ELAPSED_RATE)
        );

        this.transactions = this.chartService.getTradeCount();
    }

}
