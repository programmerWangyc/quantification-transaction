import { RouterModule, Routes } from '@angular/router';

import { AgentAddComponent } from './agent-add/agent-add.component';
import { AgentComponent } from './agent/agent.component';

const routs: Routes = [
    { path: '', component: AgentComponent },
    { path: 'add', component: AgentAddComponent },
];

export const routing = RouterModule.forChild(routs);
