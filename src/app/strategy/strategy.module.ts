import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MarkdownModule } from 'ngx-markdown';

import { SharedModule } from '../shared/shared.module';
import { ToolModule } from '../tool/tool.module';
import { AddArgComponent } from './add-arg/add-arg.component';
import { AlternationPreviewComponent } from './alternation-preview/alternation-preview.component';
import { ArgListComponent } from './arg-list/arg-list.component';
import { DIRECTIVES } from './directives/index.directive';
import { GenKeyPanelComponent } from './gen-key-panel/gen-key-panel.component';
import { InnerShareConfirmComponent } from './inner-share-confirm/inner-share-confirm.component';
import { PIPES } from './pipes/index.pipe';
import { StrategyConstantService } from './providers/strategy.constant.service';
import { StrategyOperateService } from './providers/strategy.operate.service';
import { StrategyService } from './providers/strategy.service';
import { PublicDetailComponent } from './public-detail/public-detail.component';
import { ShareConfirmComponent } from './share-confirm/share-confirm.component';
import { StrategyArgComponent } from './strategy-arg/strategy-arg.component';
import { StrategyCodemirrorComponent } from './strategy-codemirror/strategy-codemirror.component';
import { StrategyDependanceComponent } from './strategy-dependance/strategy-dependance.component';
import { StrategyDesComponent } from './strategy-des/strategy-des.component';
import { StrategyListComponent } from './strategy-list/strategy-list.component';
import { StrategyMarketComponent } from './strategy-market/strategy-market.component';
import { StrategyOverviewComponent } from './strategy-overview/strategy-overview.component';
import { StrategyRemoteEditComponent } from './strategy-remote-edit/strategy-remote-edit.component';
import { StrategyRenewalComponent } from './strategy-renewal/strategy-renewal.component';
import { VerifyGenKeyComponent } from './verify-gen-key/verify-gen-key.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        MarkdownModule.forRoot(),
        RouterModule,
    ],
    declarations: [
        StrategyArgComponent,
        DIRECTIVES,
        PIPES,
        StrategyListComponent,
        StrategyOverviewComponent,
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
        StrategyDependanceComponent,
        AlternationPreviewComponent,
        StrategyMarketComponent,
        PublicDetailComponent,
    ],
    providers: [
        StrategyService,
        StrategyOperateService,
        StrategyConstantService,
    ],
    entryComponents: [
        ShareConfirmComponent,
        InnerShareConfirmComponent,
        GenKeyPanelComponent,
        StrategyRenewalComponent,
    ],
    exports: [
        StrategyArgComponent,
        DIRECTIVES,
        PIPES,
        StrategyListComponent,
        StrategyOverviewComponent,
        VerifyGenKeyComponent,
        StrategyDesComponent,
        StrategyRemoteEditComponent,
        StrategyCodemirrorComponent,
        AddArgComponent,
        ArgListComponent,
        StrategyDependanceComponent,
        AlternationPreviewComponent,
        StrategyMarketComponent,
        PublicDetailComponent,
    ],
})
export class StrategyModule { }
