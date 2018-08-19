import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MarkdownModule } from 'ngx-markdown';

import { SharedModule } from '../shared/shared.module';
import { AddArgComponent } from './add-arg/add-arg.component';
import { AlternationPreviewComponent } from './alternation-preview/alternation-preview.component';
import { ArgListComponent } from './arg-list/arg-list.component';
import { DIRECTIVES } from './directives/index.directive';
import { GenKeyPanelComponent } from './gen-key-panel/gen-key-panel.component';
import { InnerShareConfirmComponent } from './inner-share-confirm/inner-share-confirm.component';
import { PIPES } from './pipes/index.pipe';
import { StrategyGuard } from './providers/guard.service';
import { StrategyConstantService } from './providers/strategy.constant.service';
import { StrategyOperateService } from './providers/strategy.operate.service';
import { StrategyService } from './providers/strategy.service';
import { ShareConfirmComponent } from './share-confirm/share-confirm.component';
import { StrategyAddComponent } from './strategy-add/strategy-add.component';
import { StrategyCodemirrorComponent } from './strategy-codemirror/strategy-codemirror.component';
import { StrategyCopyComponent } from './strategy-copy/strategy-copy.component';
import { StrategyCreateMetaComponent } from './strategy-create-meta/strategy-create-meta.component';
import { StrategyDependanceComponent } from './strategy-dependance/strategy-dependance.component';
import { StrategyDesComponent } from './strategy-des/strategy-des.component';
import { StrategyEditComponent } from './strategy-edit/strategy-edit.component';
import { StrategyListComponent } from './strategy-list/strategy-list.component';
import { StrategyOverviewComponent } from './strategy-overview/strategy-overview.component';
import { StrategyRemoteEditComponent } from './strategy-remote-edit/strategy-remote-edit.component';
import { StrategyRenewalComponent } from './strategy-renewal/strategy-renewal.component';
import { StrategyVerifyCodeComponent } from './strategy-verify-code/strategy-verify-code.component';
import { routing } from './strategy.routing';
import { StrategyComponent } from './strategy/strategy.component';
import { VerifyGenKeyComponent } from './verify-gen-key/verify-gen-key.component';
import { BacktestModule } from '../backtest/backtest.module';

@NgModule({
    imports: [
        BacktestModule,
        CommonModule,
        SharedModule,
        MarkdownModule.forRoot(),
        routing,
    ],
    declarations: [
        AddArgComponent,
        AlternationPreviewComponent,
        ArgListComponent,
        DIRECTIVES,
        GenKeyPanelComponent,
        InnerShareConfirmComponent,
        PIPES,
        ShareConfirmComponent,
        StrategyCodemirrorComponent,
        StrategyDependanceComponent,
        StrategyDesComponent,
        StrategyListComponent,
        StrategyOverviewComponent,
        StrategyRemoteEditComponent,
        StrategyRenewalComponent,
        VerifyGenKeyComponent,
        StrategyComponent,
        StrategyAddComponent,
        StrategyCopyComponent,
        StrategyCreateMetaComponent,
        StrategyEditComponent,
        StrategyVerifyCodeComponent,
    ],
    providers: [
        StrategyConstantService,
        StrategyOperateService,
        StrategyService,
        StrategyGuard,
    ],
    entryComponents: [
        GenKeyPanelComponent,
        InnerShareConfirmComponent,
        ShareConfirmComponent,
        StrategyRenewalComponent,
    ],
    exports: [
        DIRECTIVES,
        PIPES,
        StrategyRenewalComponent,
    ],
})
export class StrategyModule { }
