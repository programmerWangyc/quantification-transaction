import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, startWith } from 'rxjs/operators';

import { BacktestStatistic } from '../backtest.config';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-status',
    templateUrl: './backtest-status.component.html',
    styleUrls: ['./backtest-status.component.scss']
})
export class BacktestStatusComponent implements OnInit {

    completedTasks: Observable<number>;

    loadBytes: Observable<number>;

    logTotal: Observable<number>;

    percent: Observable<number>;

    profit: Observable<number>;

    status: Observable<string>;

    tasks: Observable<number>;

    timeConsuming: Observable<number>;

    transactions: Observable<number>;

    constructor(
        private backtestService: BacktestService,
    ) { }

    ngOnInit() {

        this.completedTasks = this.backtestService.getBacktestTaskResults().pipe(
            map(results => results.length)
        );

        this.loadBytes = this.backtestService.getBacktestStatistics(BacktestStatistic.LoadBytes);

        this.logTotal = this.backtestService.getBacktestStatistics(BacktestStatistic.LogsCount);

        this.percent = this.backtestService.getBacktestProgress().pipe(
            startWith(0)
        );

        this.profit = this.backtestService.getBacktestStatistics(BacktestStatistic.Profit);

        this.status = this.backtestService.isBacktesting().pipe(
            map(isLoading => isLoading ? 'RUNNING' : 'COMPLETE')
        );

        this.tasks = this.backtestService.getUIState().pipe(
            filter(state => !!state.backtestTasks),
            map(state => state.backtestTasks.length || 1)
        );

        this.timeConsuming = this.backtestService.getBacktestStatistics(BacktestStatistic.Elapsed).pipe(
            map(data => data / 1000000000) // 没细看这个为啥是这么多0， 抄的。
        );

        this.transactions = this.backtestService.getTradeCount();
    }

}
