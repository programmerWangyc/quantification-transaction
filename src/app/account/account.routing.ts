import { RouterModule, Routes } from '@angular/router';

import { AccountComponent } from './account/account.component';
import { GoogleVerifyComponent } from './google-verify/google-verify.component';
import { NicknameComponent } from './nickname/nickname.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SubaccountComponent } from './subaccount/subaccount.component';
import { WechatComponent } from './wechat/wechat.component';

const routs: Routes = [
    { path: '', component: AccountComponent },
    { path: 'reset', component: ResetPasswordComponent },
    { path: 'nickname', component: NicknameComponent },
    { path: 'wechat', component: WechatComponent },
    { path: 'google', component: GoogleVerifyComponent },
    { path: 'usergroup', component: SubaccountComponent },
];

export const routing = RouterModule.forChild(routs);
