import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { SharedModule } from '../shared/shared.module';
import { routing } from './message.routing';
import { MessageService } from './providers/message.service';
import { MessageListComponent } from './message-list/message-list.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        routing,
    ],
    declarations: [
        MessageComponent,
        MessageListComponent,
    ],
    providers: [
        MessageService,
    ],
})
export class MessageModule { }
