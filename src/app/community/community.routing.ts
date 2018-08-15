import { RouterModule, Routes } from '@angular/router';
import { CommunityComponent } from './community/community.component';
import { TopicComponent } from './topic/topic.component';
import { TopicResolver } from './providers/community.guard.service';

const routs: Routes = [
    { path: '', component: CommunityComponent },
    { path: ':id/:title', component: TopicComponent, resolve: { topic: TopicResolver } },
];


export const routing = RouterModule.forChild(routs);
