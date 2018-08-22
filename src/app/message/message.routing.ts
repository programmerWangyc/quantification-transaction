import { RouterModule, Routes } from '@angular/router';

import { MessageComponent } from './message/message.component';

const routs: Routes = [
    { path: '', component: MessageComponent },
];

export const routing = RouterModule.forChild(routs);
