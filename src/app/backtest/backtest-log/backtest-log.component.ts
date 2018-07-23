import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { BacktestLogResult } from '../backtest.interface';
import { BacktestChartService } from '../providers/backtest.chart.service';

export interface BacktestTaskLog {
    period: number;
    trade: number;

}

@Component({
    selector: 'app-backtest-log',
    templateUrl: './backtest-log.component.html',
    styleUrls: ['./backtest-log.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacktestLogComponent implements OnInit {

    /**
     * Col names;
     */
    cols: Observable<string[]>;

    /**
     * Backtest log
     */
    logs: Observable<BacktestLogResult[]>;

    /**
     * Backtest task
     */
    tasks: number[][] = [];

    /**
     * Whether logs could be downloaded;
     */
    canSave: Observable<boolean>;

    constructor(
        private chartService: BacktestChartService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.cols = this.chartService.getBacktestLogCols();

        // 注意： 这条流上会有 null 抛出，代表这个回测结果失败。
        this.logs = this.chartService.getBacktestLogResults();

        this.chartService.getBacktestLogRows()
            .subscribe(result => this.tasks = result)

        this.canSave = this.chartService.canSaveResult();
    }

    /**
     * @ignore
     */
    onDownload() {
        this.chartService.downloadLogs();
    }
}
