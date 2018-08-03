import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../shared/shared.module';
import { AccountBalanceComponent } from './account-balance/account-balance.component';
import { ChargeHistoryComponent } from './charge-history/charge-history.component';
import { ChargeComponent } from './charge/charge.component';
import { PIPES } from './pipes/index.pipe';
import { ChargeConstantService } from './providers/charge.constant.service';
import { ChargeService } from './providers/charge.service';
import { RentComponent } from './rent/rent.component';
import { PaymentIndicatorComponent } from './payment-indicator/payment-indicator.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        QRCodeModule,
    ],
    declarations: [
        ChargeComponent,
        ChargeHistoryComponent,
        PIPES,
        AccountBalanceComponent,
        RentComponent,
        PaymentIndicatorComponent,
    ],
    providers: [
        ChargeService,
        ChargeConstantService,
    ],
    exports: [
        ChargeComponent,
        ChargeHistoryComponent,
        AccountBalanceComponent,
        PIPES,
        RentComponent,
    ],
})
export class ChargeModule { }
