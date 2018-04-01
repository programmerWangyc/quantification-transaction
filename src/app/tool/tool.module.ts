import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { TextCenterDirective } from './directives/style.directive';
import { CustomSnackBarComponent } from './tool.components';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
    ],
    declarations: [
        CustomSnackBarComponent,
        TextCenterDirective,
    ],
    
    entryComponents: [
        CustomSnackBarComponent,
    ],
    exports: [
        TextCenterDirective,
    ]
})
export class ToolModule { }
