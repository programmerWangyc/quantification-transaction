import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'angular2-markdown';

import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { AgreementComponent } from './agreement/agreement.component';
import { AuthComponent } from './auth.component';
import { routing } from './auth.routing';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { AuthService } from './providers/auth.service';
import { ResetComponent } from './reset/reset.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        MarkdownModule.forRoot(),
        ToolModule,
        routing
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
    providers: [AuthService],
})
export class AuthModule { }