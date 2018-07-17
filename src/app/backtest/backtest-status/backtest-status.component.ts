import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, startWith } from 'rxjs/operators';

import { BacktestStatistic } from '../backtest.config';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { BacktestResultService } from '../providers/backtest.result.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-status',
    templateUrl: './backtest-status.component.html',
    styleUrls: ['./backtest-status.component.scss']
})
export class BacktestStatusComponent implements OnInit {

    processingTaskIndex: Observable<number>;

    loadBytes: Observable<number>;

    logTotal: Observable<number>;

    progress: Observable<number>;

    profit: Observable<number>;

    status: Observable<string>;

    tasks: Observable<number>;

    timeConsuming: Observable<number>;

    transactions: Observable<number>;

    constructor(
        private backtestService: BacktestService,
        private constant: BacktestConstantService,
        private resultService: BacktestResultService,
    ) { }

    ngOnInit() {

        this.processingTaskIndex = this.resultService.getIndexOfBacktestingTask();

        this.loadBytes = this.resultService.getBacktestStatistics(BacktestStatistic.LoadBytes);

        this.logTotal = this.resultService.getBacktestStatistics(BacktestStatistic.LogsCount);

        this.progress = this.resultService.getBacktestProgress().pipe(
            startWith(0)
        );

        this.profit = this.resultService.getBacktestStatistics(BacktestStatistic.Profit);

        this.status = this.backtestService.isBacktesting().pipe(
            map(isLoading => isLoading ? 'RUNNING' : 'COMPLETE')
        );

        this.tasks = this.backtestService.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            map(state => state.backtestTasks.length || 1)
        );

        this.timeConsuming = this.resultService.getBacktestStatistics(BacktestStatistic.Elapsed).pipe(
            map(data => data / this.constant.BACKTEST_RESULT_ELAPSED_RATE)
        );

        this.transactions = this.resultService.getTradeCount();
    }

}
