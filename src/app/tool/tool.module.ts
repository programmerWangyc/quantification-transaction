import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';
import { ConfirmComponent } from './confirm/confirm.component';
import { TextCenterDirective } from './directives/style.directive';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FromJSONPipe } from './pipes/from-json.pipe';
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
        IndicatorComponent,
        NavbarComponent,
        FooterComponent,
        ConfirmComponent,
        FromJSONPipe,
        VerifyPasswordComponent,
    ],
    
    entryComponents: [
        CustomSnackBarComponent,
        ConfirmComponent,
        VerifyPasswordComponent,
    ],
    exports: [
        TextCenterDirective,
        IndicatorComponent,
        NavbarComponent,
        FooterComponent,
        FromJSONPipe,
    ]
})
export class ToolModule { }
