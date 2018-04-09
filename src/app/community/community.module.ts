import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { CommunityRoutingModule } from './community.routing.module';
import { ContainerComponent } from './container/container.component';

@NgModule({
  imports: [
    CommonModule,
    CommunityRoutingModule,
    SharedModule,
  ],
  declarations: [ContainerComponent]
})
export class CommunityModule { }
