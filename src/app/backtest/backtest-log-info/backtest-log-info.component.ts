import { Component, OnInit } from '@angular/core';

import { includes } from 'lodash';
import { combineLatest, concat, of, Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith } from 'rxjs/operators';

import { RunningLog } from '../../interfaces/response.interface';
import { UtilService } from '../../providers/util.service';
import { BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-backtest-log-info',
    templateUrl: './backtest-log-info.component.html',
    styleUrls: ['./backtest-log-info.component.scss'],
})
export class BacktestLogInfoComponent implements OnInit {

    /**
     * Running logs
     */
    logs: Observable<RunningLog[]>;

    /**
     * Whether the logs could be downloaded.
     */
    canSave: Observable<boolean>;

    /**
     * Log statistics;
     */
    statistics: Observable<string>;

    /**
     * Log total amount.
     */
    logTotal: Observable<number>;

    /**
     * Page size.
     */
    pageSize: Observable<number> = of(50);

    /**
     * @ignore
     */
    pageSize$: Subject<number> = new Subject();

    /**
     * @ignore
     */
    search$: Subject<number[]> = new Subject();

    /**
     * @ignore
     */
    pageIndex$: Subject<number> = new Subject();

    constructor(
        private chartService: BacktestChartService,
        private utilService: UtilService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.logs = combineLatest(
            this.orderLogs(),
            this.search$,
            concat(this.pageSize, this.pageSize$),
            this.pageIndex$.pipe(
                startWith(1)
            )
        ).pipe(
            map(([logs, selectedTypes, pageSize, index]) => {
                const result = selectedTypes.length ? logs.filter(log => includes(selectedTypes, log.logType)) : logs;

                const start = (index - 1) * pageSize;

                const end = start + pageSize;

                return result.slice(start, end);
            }),
            startWith([])
        );

        this.logTotal = this.orderLogs().pipe(
            map(logs => logs.length)
        );

        this.statistics = this.utilService.getPaginationStatistics(this.logTotal, concat(this.pageSize, this.pageSize$));

        this.canSave = this.chartService.hasRunningLogs();
    }

    /**
     * Reverse the logs.
     */
    private orderLogs(): Observable<RunningLog[]> {
        return this.chartService.getRunningLogs().pipe(
            map(logs => logs.reverse())
        );
    }

    /**
     * Reactive the download action send by user.
     */
    onDownload() {
        this.chartService.downloadRunningLog();
    }

}
