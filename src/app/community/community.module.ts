import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommentModule } from '../comment/comment.module';
import { SharedModule } from '../shared/shared.module';
import { routing } from './community.routing';
import { CommunityComponent } from './community/community.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { NodesPanelComponent } from './nodes-panel/nodes-panel.component';
import { CommunityService } from './providers/community.service';
import { TopicsComponent } from './topics/topics.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
        CommentModule,
        routing,
    ],
    declarations: [
        CommunityComponent,
        NavigatorComponent,
        TopicsComponent,
        NodesPanelComponent,
    ],
    providers: [
        CommunityService,
    ],
})
export class CommunityModule { }
