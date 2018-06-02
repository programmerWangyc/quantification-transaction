import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';
import { ConfirmComponent } from './confirm/confirm.component';
import { TextCenterDirective, TextDirectionDirective } from './directives/style.directive';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FromJSONPipe } from './pipes/from-json.pipe';
import { OriginDataPipe } from './pipes/origin-data.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
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
        CustomSnackBarComponent,
        TextCenterDirective,
        TextDirectionDirective,
        IndicatorComponent,
        NavbarComponent,
        FooterComponent,
        ConfirmComponent,
        VerifyPasswordComponent,
        FromJSONPipe,
        SafeHtmlPipe,
        OriginDataPipe,
        SimpleNzConfirmWrapComponent,
    ],

    entryComponents: [
        CustomSnackBarComponent,
        ConfirmComponent,
        VerifyPasswordComponent,
        SimpleNzConfirmWrapComponent,
    ],
    exports: [
        TextCenterDirective,
        TextDirectionDirective,
        IndicatorComponent,
        NavbarComponent,
        FooterComponent,
        FromJSONPipe,
        SafeHtmlPipe,
        OriginDataPipe,
        SimpleNzConfirmWrapComponent,
    ]
})
export class ToolModule { }
