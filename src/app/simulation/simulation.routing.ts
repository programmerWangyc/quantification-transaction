import { RouterModule, Routes } from '@angular/router';

import { SimulationComponent } from './simulation/simulation.component';

const routs: Routes = [
    {
        path: '',
        component: SimulationComponent,
    },
];


export const routing = RouterModule.forChild(routs);
