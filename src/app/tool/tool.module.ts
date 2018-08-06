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
import { ShareComponent } from './share/share.component';
import { QRCodeModule } from 'angular2-qrcode';
import { CommentComponent } from './comment/comment.component';
import { ReplyComponent } from './reply/reply.component';

@NgModule({
    imports: [
        CommonModule,
        QRCodeModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        CommentComponent,
        ConfirmComponent,
        CustomSnackBarComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        ReplyComponent,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        TextCenterDirective,
        TextDirectionDirective,
        VerifyPasswordComponent,
    ],

    entryComponents: [
        ConfirmComponent,
        CustomSnackBarComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        CommentComponent,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        ReplyComponent,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        TextCenterDirective,
        TextDirectionDirective,
    ],
})
export class ToolModule { }
