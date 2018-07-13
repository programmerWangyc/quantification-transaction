import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { RunningLog } from './../../interfaces/response.interface';
import { BacktestResultService } from './../providers/backtest.result.service';

@Component({
    selector: 'app-backtest-log-info',
    templateUrl: './backtest-log-info.component.html',
    styleUrls: ['./backtest-log-info.component.scss']
})
export class BacktestLogInfoComponent implements OnInit {
    logs: Observable<RunningLog[]>;

    canSave: Observable<boolean>;

    constructor(
        private resultService: BacktestResultService
    ) { }

    ngOnInit() {
        this.logs = this.resultService.getRunningLogs();

        this.canSave = this.resultService.hasRunningLogs();
    }

    onDownload() {
        this.resultService.downloadRunningLog();
    }

}
