import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { SquareComponent } from './square/square.component';
import { StrategyModule } from '../strategy/strategy.module';
import { ToolModule } from '../tool/tool.module';
import { StrategyDetailComponent } from './strategy-detail/strategy-detail.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        StrategyModule,
        ToolModule,
    ],
    declarations: [
        SquareComponent,
        StrategyDetailComponent,
    ],
    exports: [
        SquareComponent,
        StrategyDetailComponent,
    ],
})
export class SquareModule { }
