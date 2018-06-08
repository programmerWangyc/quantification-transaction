import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { AddArgComponent } from './add-arg/add-arg.component';
import { ArgListComponent } from './arg-list/arg-list.component';
import { DIRECTIVES } from './directives/index.directive';
import { GenKeyPanelComponent } from './gen-key-panel/gen-key-panel.component';
import { InnerShareConfirmComponent } from './inner-share-confirm/inner-share-confirm.component';
import { PIPES } from './pipes/index.pipe';
import { StrategyConstantService } from './providers/strategy.constant.service';
import { StrategyOperateService } from './providers/strategy.operate.service';
import { StrategyService } from './providers/strategy.service';
import { ShareConfirmComponent } from './share-confirm/share-confirm.component';
import { StrateOverviewComponent } from './strate-overview/strate-overview.component';
import { StrategyArgComponent } from './strategy-arg/strategy-arg.component';
import { StrategyCodemirrorComponent } from './strategy-codemirror/strategy-codemirror.component';
import { StrategyDesComponent } from './strategy-des/strategy-des.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';
import { StrategyListComponent } from './strategy-list/strategy-list.component';
import { StrategyRemoteEditComponent } from './strategy-remote-edit/strategy-remote-edit.component';
import { StrategyRenewalComponent } from './strategy-renewal/strategy-renewal.component';
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
        DIRECTIVES,
        PIPES,
        StrategyListComponent,
        StrateOverviewComponent,
        ShareConfirmComponent,
        InnerShareConfirmComponent,
        GenKeyPanelComponent,
        VerifyGenKeyComponent,
        StrategyRenewalComponent,
        StrategyDesComponent,
        StrategyRemoteEditComponent,
        StrategyCodemirrorComponent,
        AddArgComponent,
        ArgListComponent,

    ],
    providers: [
        StrategyService,
        StrategyOperateService,
        StrategyConstantService,
    ],
    entryComponents:  [
        ShareConfirmComponent,
        InnerShareConfirmComponent,
        GenKeyPanelComponent,
        StrategyRenewalComponent,
    ],
    exports: [
        StrategyArgComponent,
        StrategyLibComponent,
        DIRECTIVES,
        PIPES,
        StrategyListComponent,
        StrateOverviewComponent,
        VerifyGenKeyComponent,
        StrategyDesComponent,
        StrategyRemoteEditComponent,
        StrategyCodemirrorComponent,
        AddArgComponent,
        ArgListComponent,

    ]
})
export class StrategyModule { }
