import { RouterModule, Routes } from '@angular/router';

import { CommunityComponent } from './community/community.component';
import { TopicResolver } from './providers/community.guard.service';
import { TopicAddComponent } from './topic-add/topic-add.component';
import { TopicComponent } from './topic/topic.component';
import { TopicUpdateComponent } from './topic-update/topic-update.component';

const routs: Routes = [
    { path: '', component: CommunityComponent },
    { path: ':id/:title', component: TopicComponent, resolve: { topic: TopicResolver } },
    { path: 'add', component: TopicAddComponent },
    { path: 'update/:id', component: TopicUpdateComponent },
];


export const routing = RouterModule.forChild(routs);
