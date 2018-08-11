import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatSnackBarModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { QRCodeModule } from 'angular2-qrcode';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { ConfirmComponent } from './confirm/confirm.component';
import { DIRECTIVES } from './directives/directives.import';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PIPES } from './pipes/index.pipe';
import { RunningLogComponent } from './running-log/running-log.component';
import { ShareComponent } from './share/share.component';
import { SimpleNzConfirmWrapComponent } from './simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { CustomSnackBarComponent } from './tool.components';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NgZorroAntdModule,
        QRCodeModule,
        ReactiveFormsModule,
        RouterModule,
        TranslateModule,
    ],
    declarations: [
        ConfirmComponent,
        CustomSnackBarComponent,
        DIRECTIVES,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
    ],

    entryComponents: [
        ConfirmComponent,
        CustomSnackBarComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        DIRECTIVES,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
    ],
})
export class ToolModule { }
