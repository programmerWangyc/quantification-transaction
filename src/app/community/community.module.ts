import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MarkdownModule } from 'ngx-markdown';

import { CommentModule } from '../comment/comment.module';
import { SharedModule } from '../shared/shared.module';
import { routing } from './community.routing';
import { CommunityComponent } from './community/community.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { NodesPanelComponent } from './nodes-panel/nodes-panel.component';
import { TopicResolver, FormContentGuard } from './providers/community.guard.service';
import { CommunityService } from './providers/community.service';
import { TopicAddComponent } from './topic-add/topic-add.component';
import { TopicContentEditComponent } from './topic-content-edit/topic-content-edit.component';
import { TopicFormComponent } from './topic-form/topic-form.component';
import { TopicComponent } from './topic/topic.component';
import { TopicsComponent } from './topics/topics.component';
import { TopicUpdateComponent } from './topic-update/topic-update.component';

@NgModule({
    imports: [
        CommentModule,
        CommonModule,
        MarkdownModule.forRoot(),
        SharedModule,
        routing,
    ],
    declarations: [
        CommunityComponent,
        NavigatorComponent,
        NodesPanelComponent,
        TopicComponent,
        TopicsComponent,
        TopicAddComponent,
        TopicContentEditComponent,
        TopicFormComponent,
        TopicUpdateComponent,
    ],
    providers: [
        CommunityService,
        TopicResolver,
        FormContentGuard,
    ],
})
export class CommunityModule { }
