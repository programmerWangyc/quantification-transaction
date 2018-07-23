import { RouterModule, Routes } from '@angular/router';

import { Path } from '../app.config';
import { CommunityComponent } from './community/community.component';
import { DashboardComponent } from './dashboard.component';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { StrategyDetailGuard } from './providers/guard.service';
import { RechargeComponent } from './recharge/recharge.component';
import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotComponent } from './robot/robot.component';
import { SquareComponent } from './square/square.component';
import { StrategyAddComponent } from './strategy-add/strategy-add.component';
import { StrategyCopyComponent } from './strategy-copy/strategy-copy.component';
import { StrategyEditComponent } from './strategy-edit/strategy-edit.component';
import { StrategyRentComponent } from './strategy-rent/strategy-rent.component';
import { StrategyVerifyCodeComponent } from './strategy-verify-code/strategy-verify-code.component';
import { StrategyComponent } from './strategy/strategy.component';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: 'robot', component: RobotComponent },
            { path: 'robot/' + Path.createRobot, component: RobotCreationComponent },
            { path: 'robot/:id/:name', component: RobotDetailComponent },
            { path: 'robot/' + Path.debug, component: RobotDebugComponent },
            { path: 'strategy', component: StrategyComponent },
            { path: 'strategy/add', component: StrategyAddComponent, canActivate: [StrategyDetailGuard], canDeactivate: [StrategyDetailGuard] },
            { path: 'strategy/copy/:id', component: StrategyCopyComponent, canActivate: [StrategyDetailGuard], canDeactivate: [StrategyDetailGuard] },
            { path: 'strategy/edit/:id', component: StrategyEditComponent, canActivate: [StrategyDetailGuard], canDeactivate: [StrategyDetailGuard] },
            { path: 'strategy/backtest/:id', component: DocComponent },
            // { path: 'strategy' + '/:id/:name', component: StrategyLibComponent },
            { path: 'strategy/verify/:id/:codeType', component: StrategyVerifyCodeComponent },
            { path: 'strategy/rent/:id', component: StrategyRentComponent },
            { path: 'charge', component: RechargeComponent },
            // { path: Path.exchange, component: ExchangeComponent },
            // { path: Path.trustee, component: TrusteeComponent },
            { path: 'square', component: SquareComponent },
            { path: 'community', component: CommunityComponent },
            { path: 'doc', component: DocComponent },
            { path: 'fact', component: FactComponent },
            { path: '', redirectTo: 'robot', pathMatch: 'full' },
            // { path: '', redirectTo: Path.robot, pathMatch: 'full' },
        ]
    },
];

export const routing = RouterModule.forChild(routs);
