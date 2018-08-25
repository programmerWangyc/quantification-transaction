import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CommentComponent } from './comment/comment.component';
import { OperateCommentComponent } from './operate-comment/operate-comment.component';
import { CommentService } from './providers/comment.service';
import { ReplyComponent } from './reply/reply.component';
import { MarkdownModule } from 'ngx-markdown';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        MarkdownModule.forRoot(),
        RouterModule,
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
