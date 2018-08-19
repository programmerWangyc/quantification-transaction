import { RouterModule, Routes } from '@angular/router';

import { RechargeComponent } from './recharge/recharge.component';
import { ChargeGuard } from './providers/guard.service';
import { StrategyRentComponent } from './strategy-rent/strategy-rent.component';
import { StrategyGuard } from '../strategy/providers/guard.service';

const routs: Routes = [
    { path: '', component: RechargeComponent, canDeactivate: [ChargeGuard] },
    { path: ':id', component: StrategyRentComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
];


export const routing = RouterModule.forChild(routs);
