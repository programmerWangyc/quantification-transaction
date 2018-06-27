import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { mergeMap, startWith } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { PayOrder } from '../../interfaces/response.interface';
import { ChargeConstantService } from '../providers/charge.constant.service';
import { ChargeService } from '../providers/charge.service';


@Component({
    selector: 'app-charge-history',
    templateUrl: './charge-history.component.html',
    styleUrls: ['./charge-history.component.scss']
})
export class ChargeHistoryComponent implements BaseComponent {
    subscription$$: Subscription;

    historyRecords: Observable<PayOrder[]>;

    tableHead: string[] = ['SEQUENCE_NUMBER', 'DATE', 'PAYMENT_METHOD', 'RECHARGE_AMOUNT'];

    statistics: Observable<string>;

    constructor(
        private chargeService: ChargeService,
        private translate: TranslateService,
        private constant: ChargeConstantService,
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.historyRecords = this.chargeService.getSpecificHistoryOrders(this.constant.RECHARGE_PAYMENT_FLAG);

        this.statistics = this.chargeService.getHistoryOrderTotalAmount(this.historyRecords)
            .pipe(
                mergeMap(total => this.translate.get('HISTORY_TOTAL_PAY', { total }))
            );
    }

    launch() {
        this.subscription$$ = this.chargeService.launchPayOrders(this.chargeService.isRechargeSuccess()
            .pipe(
                startWith(true)
            )
        )
            .add(this.chargeService.handlePayOrdersError());
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
