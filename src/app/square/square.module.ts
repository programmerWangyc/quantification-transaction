import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommentModule } from '../comment/comment.module';
import { SharedModule } from '../shared/shared.module';
import { SquareComponent } from './square/square.component';
import { StrategyDetailComponent } from './strategy-detail/strategy-detail.component';
import { StrategyMarketComponent } from './strategy-market/strategy-market.component';
import { StrategyModule } from '../strategy/strategy.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        CommentModule,
        StrategyModule,
        RouterModule,
    ],
    declarations: [
        SquareComponent,
        StrategyDetailComponent,
        StrategyMarketComponent,
    ],
    exports: [
        SquareComponent,
    ],
})
export class SquareModule { }
