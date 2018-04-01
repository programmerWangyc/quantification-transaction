import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContainerComponent } from './container/container.component';
import { IntroComponent } from './intro/intro.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        IntroComponent,
        ContainerComponent,
    ]
})
export class HomeModule { }
