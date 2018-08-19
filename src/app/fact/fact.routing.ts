import { RouterModule, Routes } from '@angular/router';
import { FactComponent } from './fact/fact.component';
import { FactRobotComponent } from './fact-robot/fact-robot.component';

const routs: Routes = [
    { path: '', component: FactComponent },
    { path: ':id/:name', component: FactRobotComponent },
];

export const routing = RouterModule.forChild(routs);
