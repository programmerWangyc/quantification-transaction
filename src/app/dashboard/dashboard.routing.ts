import { RouterModule, Routes } from '@angular/router';

import { AgentAddComponent } from './agent-add/agent-add.component';
import { AgentComponent } from './agent/agent.component';
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
import { ExchangeComponent } from './exchange/exchange.component';
import { ExchangeAddComponent } from './exchange-add/exchange-add.component';
import { ExchangeEditComponent } from './exchange-edit/exchange-edit.component';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            // robot
            { path: 'robot', component: RobotComponent },
            { path: 'robot/add', component: RobotCreationComponent },
            { path: 'robot/:id/:name', component: RobotDetailComponent },
            { path: 'robot/debug', component: RobotDebugComponent },

            // strategy
            { path: 'strategy', component: StrategyComponent },
            { path: 'strategy/add', component: StrategyAddComponent, canActivate: [StrategyDetailGuard], canDeactivate: [StrategyDetailGuard] },
            { path: 'strategy/copy/:id', component: StrategyCopyComponent, canActivate: [StrategyDetailGuard], canDeactivate: [StrategyDetailGuard] },
            { path: 'strategy/edit/:id', component: StrategyEditComponent, canActivate: [StrategyDetailGuard], canDeactivate: [StrategyDetailGuard] },
            { path: 'strategy/backtest/:id', component: DocComponent },
            { path: 'strategy/verify/:id/:codeType', component: StrategyVerifyCodeComponent },
            { path: 'strategy/rent/:id', component: StrategyRentComponent },

            // charge
            { path: 'charge', component: RechargeComponent },

            // agent
            { path: 'agent', component: AgentComponent },
            { path: 'agent/add', component: AgentAddComponent },

            // exchange
            { path: 'exchange', component: ExchangeComponent },
            { path: 'exchange/add', component: ExchangeAddComponent },
            { path: 'exchange/edit/:id', component: ExchangeEditComponent },

            // { path: Path.exchange, component: ExchangeComponent },
            { path: 'square', component: SquareComponent },
            { path: 'community', component: CommunityComponent },
            { path: 'doc', component: DocComponent },
            { path: 'fact', component: FactComponent },
            { path: '', redirectTo: 'robot', pathMatch: 'full' },
            // { path: '', redirectTo: Path.robot, pathMatch: 'full' },
        ],
    },
];

export const routing = RouterModule.forChild(routs);
