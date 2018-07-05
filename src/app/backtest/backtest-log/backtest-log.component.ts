import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { BacktestLogResult } from '../backtest.interface';
import { BacktestResultService } from '../providers/backtest.result.service';

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
    cols: Observable<string[]>;

    logs: Observable<BacktestLogResult[]>;

    tasks: number[][];

    constructor(
        private resultService: BacktestResultService,
    ) { }

    ngOnInit() {
        this.cols = this.resultService.getBacktestLogCols();

        // 注意： 这条流上会有 null 抛出，代表这个回测结果失败。
        this.logs = this.resultService.getBacktestLogResults();

        this.resultService.getBacktestLogRows()
            .subscribe(result => this.tasks = result)
    }
}
