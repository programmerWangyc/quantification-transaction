import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { PIPES } from './pipes/index.pipe';
import { StrategyService } from './providers/strategy.service';
import { StrategyArgComponent } from './strategy-arg/strategy-arg.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RouterModule,
    ],
    declarations: [
        StrategyArgComponent,
        StrategyLibComponent,
        PIPES,
    ],
    providers: [
        StrategyService,
    ],
    exports: [
        StrategyArgComponent,
        StrategyLibComponent,
        PIPES,
    ]
})
export class StrategyModule { }
