import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { QRCodeModule } from 'angular2-qrcode';
import { MarkdownModule } from 'ngx-markdown';

import { SharedModule } from '../shared/shared.module';
import { CommentComponent } from './comment/comment.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { DIRECTIVES } from './directives/directives.import';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { OperateCommentComponent } from './operate-comment/operate-comment.component';
import { PIPES } from './pipes/index.pipe';
import { ReplyComponent } from './reply/reply.component';
import { RunningLogComponent } from './running-log/running-log.component';
import { ShareComponent } from './share/share.component';
import { SimpleNzConfirmWrapComponent } from './simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { CustomSnackBarComponent } from './tool.components';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        QRCodeModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        CommentComponent,
        ConfirmComponent,
        CustomSnackBarComponent,
        DIRECTIVES,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        ReplyComponent,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
        OperateCommentComponent,
    ],

    entryComponents: [
        ConfirmComponent,
        CustomSnackBarComponent,
        SimpleNzConfirmWrapComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        CommentComponent,
        DIRECTIVES,
        FooterComponent,
        IndicatorComponent,
        NavbarComponent,
        PIPES,
        ReplyComponent,
        RunningLogComponent,
        ShareComponent,
        SimpleNzConfirmWrapComponent,
    ],
})
export class ToolModule { }
