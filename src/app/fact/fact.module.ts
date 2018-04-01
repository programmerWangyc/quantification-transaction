import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContainerComponent } from './container/container.component';
import { FactRoutingModule } from './fact.routing.module';

@NgModule({
    imports: [
        CommonModule,
        FactRoutingModule,
    ],
    declarations: [ContainerComponent]
})
export class FactModule { }
