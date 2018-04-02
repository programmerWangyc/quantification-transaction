import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MarkdownModule } from 'angular2-markdown';

import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { AgreementComponent } from './agreement/agreement.component';
import { ContainerComponent } from './container/container.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './providers/auth.service';
import { ResetComponent } from './reset/reset.component';
import { SignupComponent } from './signup/signup.component';
import { PasswordComponent } from './password/password.component';

const routs: Routes = [
    {
        path: '',
        component: ContainerComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: SignupComponent },
            { path: 'reset', component: ResetComponent },
            { path: 'pwd/:token', component: PasswordComponent },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routs),
        ReactiveFormsModule,
        FormsModule,
        MarkdownModule.forRoot(),
        ToolModule,
    ],
    declarations: [
        SignupComponent,
        LoginComponent,
        ContainerComponent,
        AgreementComponent,
        ResetComponent,
        PasswordComponent,
    ],
    entryComponents: [
        AgreementComponent,
    ],
    providers: [AuthService]
})
export class AuthModule { }