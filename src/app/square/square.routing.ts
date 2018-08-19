import { RouterModule, Routes } from '@angular/router';

import { SquareComponent } from './square/square.component';
import { StrategyDetailComponent } from './strategy-detail/strategy-detail.component';

const routs: Routes = [
    { path: '', component: SquareComponent },
    { path: 'strategy/:id', component: StrategyDetailComponent },
];


export const routing = RouterModule.forChild(routs);
