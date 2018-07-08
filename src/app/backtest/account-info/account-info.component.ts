import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

import { BacktestAccount } from '../backtest.interface';
import { BacktestResultService } from '../providers/backtest.result.service';

@Component({
    selector: 'app-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {
    data: Observable<BacktestAccount[]>;

    hasFutures: Observable<boolean>;

    constructor(
        private resultService: BacktestResultService,
    ) { }

    ngOnInit() {
        this.data = this.resultService.getBacktestAccountInfo()

        this.hasFutures = this.data.pipe(
            map(accounts => accounts.some(account => account.isFutures))
        );
    }

}
