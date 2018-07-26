import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeListComponent } from './exchange-list/exchange-list.component';
import { CreateExchangeComponent } from './create-exchange/create-exchange.component';
import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { RouterModule } from '@angular/router';
import { ExchangeConstantService } from './providers/exchange.constant.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RouterModule,
    ],
    declarations: [
        ExchangeListComponent,
        CreateExchangeComponent,
    ],
    exports: [
        ExchangeListComponent,
        CreateExchangeComponent,
    ],
    providers: [
        ExchangeConstantService,
    ],
})
export class ExchangeModule { }
