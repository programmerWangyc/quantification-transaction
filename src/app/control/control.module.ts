import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContainerComponent } from './container/container.component';
import { ControlRoutingModule } from './control.routing.module';

@NgModule({
  imports: [
    CommonModule,
    ControlRoutingModule,
  ],
  declarations: [ContainerComponent]
})
export class ControlModule { }
