import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeListComponent } from './exchange-list/exchange-list.component';
import { CreateExchangeComponent } from './create-exchange/create-exchange.component';
import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { RouterModule } from '@angular/router';
import { ExchangeConstantService } from './providers/exchange.constant.service';
import { UpdateExchangeComponent } from './update-exchange/update-exchange.component';
import { ExchangeSelectComponent } from './exchange-select/exchange-select.component';
import { ExchangeService } from './providers/exchange.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RouterModule,
    ],
    declarations: [
        ExchangeListComponent,
        ExchangeSelectComponent,
        CreateExchangeComponent,
        UpdateExchangeComponent,
    ],
    exports: [
        ExchangeListComponent,
        CreateExchangeComponent,
        UpdateExchangeComponent,
    ],
    providers: [
        ExchangeConstantService,
        ExchangeService,
    ],
})
export class ExchangeModule { }
