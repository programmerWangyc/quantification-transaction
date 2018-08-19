import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { routing } from './document.routing';
import { DocumentComponent } from './document/document.component';
import { SharedModule } from '../shared/shared.module';
import { DocumentService } from './providers/document.service';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule.forRoot(),
        SharedModule,
        routing,
    ],
    declarations: [
        DocumentComponent,
    ],
    providers: [
        DocumentService,
    ],
})
export class DocumentModule { }
