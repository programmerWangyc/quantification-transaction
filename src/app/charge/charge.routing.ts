import { RouterModule, Routes } from '@angular/router';

import { RechargeComponent } from './recharge/recharge.component';
import { ChargeGuard, StrategyGuard } from './providers/guard.service';
import { StrategyRentComponent } from './strategy-rent/strategy-rent.component';

const routs: Routes = [
    { path: '', component: RechargeComponent, canDeactivate: [ChargeGuard] },
    { path: 'rent/:id', component: StrategyRentComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
];


export const routing = RouterModule.forChild(routs);
