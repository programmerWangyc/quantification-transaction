import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MarkdownModule } from 'ngx-markdown';

import { SharedModule } from '../shared/shared.module';
import { AgreementComponent } from './agreement/agreement.component';
import { AuthComponent } from './auth.component';
import { routing } from './auth.routing';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { ResetComponent } from './reset/reset.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MarkdownModule.forRoot(),
        routing,
    ],
    declarations: [
        SignupComponent,
        LoginComponent,
        AuthComponent,
        AgreementComponent,
        ResetComponent,
        PasswordComponent,
    ],
    entryComponents: [
        AgreementComponent,
    ],
})
export class AuthModule { }
