import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../shared/shared.module';
import { AccountBalanceComponent } from './account-balance/account-balance.component';
import { ChargeHistoryComponent } from './charge-history/charge-history.component';
import { ChargeComponent } from './charge/charge.component';
import { PIPES } from './pipes/index.pipe';
import { ChargeService } from './providers/charge.service';

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
    ],
    providers: [
        ChargeService,
    ],
    exports: [
        ChargeComponent,
        ChargeHistoryComponent,
        AccountBalanceComponent,
        PIPES,
    ],
    entryComponents: [

    ]
})
export class ChargeModule { }
