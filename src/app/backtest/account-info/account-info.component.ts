import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

import { BacktestAccount } from '../backtest.interface';
import { BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent implements OnInit {
    /**
     * Account info.
     */
    data: Observable<BacktestAccount[]>;

    /**
     * 是否包含股票证券
     */
    hasFutures: Observable<boolean>;

    constructor(
        private chartService: BacktestChartService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.data = this.chartService.getBacktestAccountInfo();

        this.hasFutures = this.data.pipe(
            map(accounts => accounts.some(account => account.isFutures))
        );
    }

}
