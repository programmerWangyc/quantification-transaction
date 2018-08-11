import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { CreateExchangeComponent } from './create-exchange/create-exchange.component';
import { ExchangeListComponent } from './exchange-list/exchange-list.component';
import { ExchangeSelectComponent } from './exchange-select/exchange-select.component';
import { ExchangeConstantService } from './providers/exchange.constant.service';
import { ExchangeFormService } from './providers/exchange.form.service';
import { ExchangeService } from './providers/exchange.service';
import { ExchangeFormComponent } from './exchange-form/exchange-form.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        ExchangeListComponent,
        ExchangeSelectComponent,
        CreateExchangeComponent,
        ExchangeFormComponent,
    ],
    exports: [
        ExchangeListComponent,
        CreateExchangeComponent,
    ],
    providers: [
        ExchangeConstantService,
        ExchangeService,
        ExchangeFormService,
    ],
})
export class ExchangeModule { }
