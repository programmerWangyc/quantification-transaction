import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommunityRoutingModule } from './community.routing.module';
import { ContainerComponent } from './container/container.component';

@NgModule({
  imports: [
    CommonModule,
    CommunityRoutingModule,
  ],
  declarations: [ContainerComponent]
})
export class CommunityModule { }
