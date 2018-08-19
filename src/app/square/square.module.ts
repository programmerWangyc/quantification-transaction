import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommentModule } from '../comment/comment.module';
import { SharedModule } from '../shared/shared.module';
import { routing } from './square.routing';
import { SquareComponent } from './square/square.component';
import { StrategyDetailComponent } from './strategy-detail/strategy-detail.component';
import { StrategyMarketComponent } from './strategy-market/strategy-market.component';
import { PublicDetailComponent } from './public-detail/public-detail.component';
import { SquareService } from './providers/square.service';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        CommentModule,
        MarkdownModule.forRoot(),
        routing,
    ],
    declarations: [
        SquareComponent,
        StrategyDetailComponent,
        StrategyMarketComponent,
        PublicDetailComponent,
    ],
    exports: [
        SquareComponent,
    ],
    providers: [
        SquareService,
    ],
})
export class SquareModule { }
