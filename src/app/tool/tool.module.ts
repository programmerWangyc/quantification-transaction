import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { TextCenterDirective } from './directives/style.directive';
import { IndicatorComponent } from './indicator/indicator.component';
import { CustomSnackBarComponent } from './tool.components';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
    ],
    declarations: [
        CustomSnackBarComponent,
        TextCenterDirective,
        IndicatorComponent,
    ],
    
    entryComponents: [
        CustomSnackBarComponent,
    ],
    exports: [
        TextCenterDirective,
        IndicatorComponent,
    ]
})
export class ToolModule { }
