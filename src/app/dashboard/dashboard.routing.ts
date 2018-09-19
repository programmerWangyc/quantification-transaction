import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardGuard } from './providers/guard.service';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: '', component: NavigationComponent },
            { path: 'robot', loadChildren: '../robot/robot.module#RobotModule' }, // routing at login, load it;
            { path: 'strategy', loadChildren: '../strategy/strategy.module#StrategyModule' }, // routing at robot, load it;
            { path: 'charge', loadChildren: '../charge/charge.module#ChargeModule' },
            { path: 'agent', loadChildren: '../agent/agent.module#AgentModule' },
            { path: 'exchange', loadChildren: '../exchange/exchange.module#ExchangeModule' },
            { path: 'square', loadChildren: '../square/square.module#SquareModule', redirectTo: '/square' }, // loaded
            { path: 'fact', loadChildren: '../fact/fact.module#FactModule', redirectTo: '/fact' }, // loaded
            /**
             * @deprecated 暂时不搞
             */
            // { path: 'simulation', loadChildren: '../simulation/simulation.module#SimulationModule' },
            { path: 'community', loadChildren: '../community/community.module#CommunityModule', redirectTo: '/community' }, // loaded
            { path: 'doc', loadChildren: '../document/document.module#DocumentModule', redirectTo: '/doc' }, // loaded
            { path: 'account', loadChildren: '../account/account.module#AccountModule' },
            { path: 'message', loadChildren: '../message/message.module#MessageModule' },
        ],
        canActivate: [DashboardGuard],
    },
];

export const routing = RouterModule.forChild(routs);
