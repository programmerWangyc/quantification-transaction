import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentModule } from '../comment/comment.module';
import { SharedModule } from '../shared/shared.module';
import { routing } from './community.routing';
import { CommunityComponent } from './community/community.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { NodesPanelComponent } from './nodes-panel/nodes-panel.component';
import { TopicResolver } from './providers/community.guard.service';
import { CommunityService } from './providers/community.service';
import { TopicComponent } from './topic/topic.component';
import { TopicsComponent } from './topics/topics.component';


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
    ],
    providers: [
        CommunityService,
        TopicResolver,
    ],
})
export class CommunityModule { }
