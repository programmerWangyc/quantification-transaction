import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../shared/shared.module';
import { routing } from './account.routing';
import { AccountComponent } from './account/account.component';
import { GoogleVerifyComponent } from './google-verify/google-verify.component';
import { NicknameComponent } from './nickname/nickname.component';
import { AccountService } from './providers/account.service';
import { SubaccountService } from './providers/subaccount.service';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SubaccountComponent } from './subaccount/subaccount.component';
import { WechatComponent } from './wechat/wechat.component';
import { SubaccountListComponent } from './subaccount-list/subaccount-list.component';
import { PIPES } from './pipes/index.pipe';
import { ModifySubaccountPasswordComponent } from './modify-subaccount-password/modify-subaccount-password.component';
import { ModifySubaccountPermissionComponent } from './modify-subaccount-permission/modify-subaccount-permission.component';
import { ApiKeyComponent } from './api-key/api-key.component';
import { ApiKeyService } from './providers/api.key.service';
import { EarlyWarningComponent } from './early-warning/early-warning.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        QRCodeModule,
        routing,
    ],
    declarations: [
        AccountComponent,
        ResetPasswordComponent,
        NicknameComponent,
        GoogleVerifyComponent,
        SubaccountComponent,
        WechatComponent,
        SubaccountListComponent,
        PIPES,
        ModifySubaccountPasswordComponent,
        ModifySubaccountPermissionComponent,
        ApiKeyComponent,
        EarlyWarningComponent,
    ],
    entryComponents: [
        ModifySubaccountPasswordComponent,
        ModifySubaccountPermissionComponent,
    ],
    providers: [
        AccountService,
        SubaccountService,
        ApiKeyService,
        PIPES,
    ],
})
export class AccountModule { }
