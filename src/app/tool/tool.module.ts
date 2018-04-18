import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';
import { TextCenterDirective } from './directives/style.directive';
import { FooterComponent } from './footer/footer.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CustomSnackBarComponent } from './tool.components';

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
    ],
    
    entryComponents: [
        CustomSnackBarComponent,
    ],
    exports: [
        TextCenterDirective,
        IndicatorComponent,
        NavbarComponent,
        FooterComponent,
    ]
})
export class ToolModule { }
