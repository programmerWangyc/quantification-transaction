import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-result',
    templateUrl: './backtest-result.component.html',
    styleUrls: ['./backtest-result.component.scss']
})
export class BacktestResultComponent implements OnInit {
    isOptimizeBacktest: Observable<boolean>

    constructor(
        private backtestService: BacktestService,
    ) { }

    ngOnInit() {
        this.isOptimizeBacktest = this.backtestService.isOptimizeBacktest();
    }

}
