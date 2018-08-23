import { RouterModule, Routes } from '@angular/router';

import { AccountComponent } from './account/account.component';
import { GoogleVerifyComponent } from './google-verify/google-verify.component';
import { NicknameComponent } from './nickname/nickname.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SubaccountComponent } from './subaccount/subaccount.component';
import { WechatComponent } from './wechat/wechat.component';
import { ApiKeyComponent } from './api-key/api-key.component';
import { EarlyWarningComponent } from './early-warning/early-warning.component';
import { RegisterCodeComponent } from './register-code/register-code.component';

const routs: Routes = [
    { path: '', component: AccountComponent },
    { path: 'reset', component: ResetPasswordComponent },
    { path: 'nickname', component: NicknameComponent },
    { path: 'wechat', component: WechatComponent },
    { path: 'google', component: GoogleVerifyComponent },
    { path: 'usergroup', component: SubaccountComponent },
    { path: 'key', component: ApiKeyComponent },
    { path: 'warn', component: EarlyWarningComponent },
    { path: 'code', component: RegisterCodeComponent },
];

export const routing = RouterModule.forChild(routs);
