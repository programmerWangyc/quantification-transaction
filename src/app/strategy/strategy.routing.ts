import { RouterModule, Routes } from '@angular/router';

import { StrategyGuard } from './providers/guard.service';
import { StrategyAddComponent } from './strategy-add/strategy-add.component';
import { StrategyBacktestComponent } from './strategy-backtest/strategy-backtest.component';
import { StrategyCopyComponent } from './strategy-copy/strategy-copy.component';
import { StrategyEditComponent } from './strategy-edit/strategy-edit.component';
import { StrategyVerifyCodeComponent } from './strategy-verify-code/strategy-verify-code.component';
import { StrategyComponent } from './strategy/strategy.component';

const routs: Routes = [
    { path: '', component: StrategyComponent },
    { path: 'add', component: StrategyAddComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
    { path: 'copy/:id', component: StrategyCopyComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
    // 从机器人的列表中可以跳过来。如果用户只访问过机器人，此时转到edit页面时会被守卫拦截，所以把canActivated取消了。
    { path: 'edit/:id', component: StrategyEditComponent, canDeactivate: [StrategyGuard] },
    { path: 'backtest/:id', component: StrategyBacktestComponent },
    { path: 'verify/:id/:codeType', component: StrategyVerifyCodeComponent },
];


export const routing = RouterModule.forChild(routs);
