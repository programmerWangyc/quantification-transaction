import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { PIPES } from './pipes/index.pipe';
import { StrategyService } from './providers/strategy.service';
import { StrategyArgComponent } from './strategy-arg/strategy-arg.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';
import { StrategyListComponent } from './strategy-list/strategy-list.component';
import { StrateOverviewComponent } from './strate-overview/strate-overview.component';
import { StrategyOperateService } from './providers/strategy.operate.service';
import { ShareConfirmComponent } from './share-confirm/share-confirm.component';
import { InnerShareConfirmComponent } from './inner-share-confirm/inner-share-confirm.component';
import { GenKeyPanelComponent } from './gen-key-panel/gen-key-panel.component';
import { VerifyGenKeyComponent } from './verify-gen-key/verify-gen-key.component';

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
        StrategyListComponent,
        StrateOverviewComponent,
        ShareConfirmComponent,
        InnerShareConfirmComponent,
        GenKeyPanelComponent,
        VerifyGenKeyComponent,
    ],
    providers: [
        StrategyService,
        StrategyOperateService,
    ],
    entryComponents:  [
        ShareConfirmComponent,
        InnerShareConfirmComponent,
        GenKeyPanelComponent,
    ],
    exports: [
        StrategyArgComponent,
        StrategyLibComponent,
        PIPES,
        StrategyListComponent,
        StrateOverviewComponent,
        VerifyGenKeyComponent,
    ]
})
export class StrategyModule { }
