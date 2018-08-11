import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MarkdownModule } from 'ngx-markdown';

import { SharedModule } from '../shared/shared.module';
import { CommentComponent } from './comment/comment.component';
import { OperateCommentComponent } from './operate-comment/operate-comment.component';
import { CommentService } from './providers/comment.service';
import { ReplyComponent } from './reply/reply.component';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        SharedModule,
    ],
    declarations: [
        CommentComponent,
        ReplyComponent,
        OperateCommentComponent,
    ],
    exports: [
        CommentComponent,
        ReplyComponent,
        OperateCommentComponent,
    ],
    providers: [
        CommentService,
    ],

})
export class CommentModule { }
