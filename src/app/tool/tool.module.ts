import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ConfirmComponent } from './confirm/confirm.component';
import { TextCenterDirective, TextDirectionDirective } from './directives/style.directive';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PIPES } from './pipes/index.pipe';
import { RunningLogComponent } from './running-log/running-log.component';
import { SimpleNzConfirmWrapComponent } from './simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { CustomSnackBarComponent } from './tool.components';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule
    ],
    declarations: [
        ConfirmComponent,
        CustomSnackBarComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        RunningLogComponent,
        SimpleNzConfirmWrapComponent,
        TextCenterDirective,
        TextDirectionDirective,
        VerifyPasswordComponent,
    ],

    entryComponents: [
        CustomSnackBarComponent,
        ConfirmComponent,
        VerifyPasswordComponent,
        SimpleNzConfirmWrapComponent,
    ],
    exports: [
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        RunningLogComponent,
        SimpleNzConfirmWrapComponent,
        TextCenterDirective,
        TextDirectionDirective,
    ]
})
export class ToolModule { }
