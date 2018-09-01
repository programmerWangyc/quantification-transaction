import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs';
import { mergeMap, startWith, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { PayOrder } from '../../interfaces/response.interface';
import { ChargeConstantService } from '../providers/charge.constant.service';
import { ChargeService } from '../providers/charge.service';

@Component({
    selector: 'app-charge-history',
    templateUrl: './charge-history.component.html',
    styleUrls: ['./charge-history.component.scss'],
})
export class ChargeHistoryComponent implements BaseComponent {
    historyRecords: Observable<PayOrder[]>;

    tableHead: string[] = ['SEQUENCE_NUMBER', 'DATE', 'PAYMENT_METHOD', 'RECHARGE_AMOUNT'];

    statistics: Observable<string>;

    isAlive = true;

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

        this.statistics = this.chargeService.getHistoryOrderTotalAmount(this.historyRecords).pipe(
            mergeMap(total => this.translate.get('HISTORY_TOTAL_PAY', { total }))
        );
    }

    launch() {
        const keepAlive = () => this.isAlive;

        this.chargeService.launchPayOrders(this.chargeService.chargeAlreadySuccess().pipe(
            startWith(true),
            takeWhile(keepAlive)
        ));

        this.chargeService.handlePayOrdersError(keepAlive);
    }

    ngOnDestroy() {
        this.isAlive = false;
    }

}
