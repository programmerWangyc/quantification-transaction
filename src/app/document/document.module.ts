import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContainerComponent } from './container/container.component';
import { DocumentRoutingModule } from './document.routing.module';

@NgModule({
  imports: [
    CommonModule,
    DocumentRoutingModule 
  ],
  declarations: [ContainerComponent]
})
export class DocumentModule { }
