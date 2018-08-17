import { RouterModule, Routes } from '@angular/router';

import { CommunityComponent } from './community/community.component';
import { TopicResolver, FormContentGuard } from './providers/community.guard.service';
import { TopicAddComponent } from './topic-add/topic-add.component';
import { TopicComponent } from './topic/topic.component';
import { TopicUpdateComponent } from './topic-update/topic-update.component';

const routs: Routes = [
    { path: '', component: CommunityComponent },
    { path: 'add', component: TopicAddComponent, canDeactivate: [FormContentGuard] },
    { path: 'update/:id', component: TopicUpdateComponent, canDeactivate: [FormContentGuard], resolve: { topic: TopicResolver } },
    { path: ':id/:title', component: TopicComponent, resolve: { topic: TopicResolver } },
];


export const routing = RouterModule.forChild(routs);
