import { RouterModule, Routes } from '@angular/router';

import { FactRobotComponent } from '../fact/fact-robot/fact-robot.component';
import { FactComponent } from '../fact/fact/fact.component';
import { SquareComponent } from '../square/square/square.component';
import { StrategyDetailComponent } from '../square/strategy-detail/strategy-detail.component';
import { AgentAddComponent } from './agent-add/agent-add.component';
import { AgentComponent } from './agent/agent.component';
import { DashboardComponent } from './dashboard.component';
import { ExchangeAddComponent } from './exchange-add/exchange-add.component';
import { ExchangeEditComponent } from './exchange-edit/exchange-edit.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { ChargeGuard, StrategyGuard } from './providers/guard.service';
import { RechargeComponent } from './recharge/recharge.component';
import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotComponent } from './robot/robot.component';
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
            // robot
            { path: 'robot', component: RobotComponent },
            { path: 'robot/add', component: RobotCreationComponent },
            { path: 'robot/:id/:name', component: RobotDetailComponent },
            { path: 'robot/debug', component: RobotDebugComponent },

            // strategy
            { path: 'strategy', component: StrategyComponent },
            { path: 'strategy/add', component: StrategyAddComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
            { path: 'strategy/copy/:id', component: StrategyCopyComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
            { path: 'strategy/edit/:id', component: StrategyEditComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },
            // { path: 'strategy/backtest/:id', component: DocComponent },
            { path: 'strategy/verify/:id/:codeType', component: StrategyVerifyCodeComponent },
            { path: 'strategy/rent/:id', component: StrategyRentComponent, canActivate: [StrategyGuard], canDeactivate: [StrategyGuard] },

            // charge
            { path: 'charge', component: RechargeComponent, canDeactivate: [ChargeGuard] },

            // agent
            { path: 'agent', component: AgentComponent },
            { path: 'agent/add', component: AgentAddComponent },

            // exchange
            { path: 'exchange', component: ExchangeComponent },
            { path: 'exchange/add', component: ExchangeAddComponent },
            { path: 'exchange/edit/:id', component: ExchangeEditComponent },

            // square
            { path: 'square', component: SquareComponent },
            { path: 'square/strategy/:id', component: StrategyDetailComponent },

            // fact
            { path: 'fact', component: FactComponent },
            { path: 'fact/:id/:name', component: FactRobotComponent },

            // simulation
            { path: 'simulation', loadChildren: '../simulation/simulation.module#SimulationModule' },

            // community
            { path: 'community', loadChildren: '../community/community.module#CommunityModule' },

            // document
            { path: 'doc', loadChildren: '../document/document.module#DocumentModule' },

            { path: '', redirectTo: 'robot', pathMatch: 'full' },
            // { path: '', redirectTo: Path.robot, pathMatch: 'full' },
        ],
    },
];

export const routing = RouterModule.forChild(routs);
