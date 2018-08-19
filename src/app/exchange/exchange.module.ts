import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CreateExchangeComponent } from './create-exchange/create-exchange.component';
import { ExchangeFormComponent } from './exchange-form/exchange-form.component';
import { ExchangeListComponent } from './exchange-list/exchange-list.component';
import { ExchangeSelectComponent } from './exchange-select/exchange-select.component';
import { routing } from './exchange.routing';
import { ExchangeConstantService } from './providers/exchange.constant.service';
import { ExchangeFormService } from './providers/exchange.form.service';
import { ExchangeService } from './providers/exchange.service';
import { ExchangeComponent } from './exchange/exchange.component';
import { ExchangeAddComponent } from './exchange-add/exchange-add.component';
import { ExchangeEditComponent } from './exchange-edit/exchange-edit.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        routing,
    ],
    declarations: [
        CreateExchangeComponent,
        ExchangeAddComponent,
        ExchangeComponent,
        ExchangeEditComponent,
        ExchangeFormComponent,
        ExchangeListComponent,
        ExchangeSelectComponent,
    ],
    providers: [
        ExchangeConstantService,
        ExchangeFormService,
        ExchangeService,
    ],
})
export class ExchangeModule { }
