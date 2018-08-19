import { RouterModule, Routes } from '@angular/router';

import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotComponent } from './robot/robot.component';

const routs: Routes = [
    { path: '', component: RobotComponent },
    { path: 'add', component: RobotCreationComponent },
    { path: 'debug', component: RobotDebugComponent },
    { path: ':id/:name', component: RobotDetailComponent },
];


export const routing = RouterModule.forChild(routs);
