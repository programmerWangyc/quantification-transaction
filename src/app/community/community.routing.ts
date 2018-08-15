import { RouterModule, Routes } from '@angular/router';
import { CommunityComponent } from './community/community.component';

const routs: Routes = [
    {
        path: '',
        component: CommunityComponent,
    },
];


export const routing = RouterModule.forChild(routs);
