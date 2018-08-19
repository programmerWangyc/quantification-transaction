import { RouterModule, Routes } from '@angular/router';

import { StrategyGuard } from './providers/guard.service';
import { StrategyAddComponent } from './strategy-add/strategy-add.component';
import { StrategyCopyComponent } from './strategy-copy/strategy-copy.component';
import { StrategyEditComponent } from './strategy-edit/strategy-edit.component';
import { StrategyVerifyCodeComponent } from './strategy-verify-code/strategy-verify-code.component';
import { StrategyComponent } from './strategy/strategy.component';

const routs: Routes = [
    { path: '', component: StrategyComponent },
    { path: 'add', component: StrategyAddComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
    { path: 'copy/:id', component: StrategyCopyComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
    { path: 'edit/:id', component: StrategyEditComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
    // { path: 'backtest/:id', component: '' },
    { path: 'verify/:id/:codeType', component: StrategyVerifyCodeComponent },
];


export const routing = RouterModule.forChild(routs);
