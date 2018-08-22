import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: 'robot', loadChildren: '../robot/robot.module#RobotModule'},

            { path: 'strategy', loadChildren: '../strategy/strategy.module#StrategyModule' },

            { path: 'charge', loadChildren: '../charge/charge.module#ChargeModule' },

            { path: 'agent', loadChildren: '../agent/agent.module#AgentModule'  },

            { path: 'exchange', loadChildren: '../exchange/exchange.module#ExchangeModule' },

            { path: 'square', loadChildren: '../square/square.module#SquareModule' },

            { path: 'fact', loadChildren: '../fact/fact.module#FactModule' },

            /**
             * @deprecated 暂时不搞
             */
            // { path: 'simulation', loadChildren: '../simulation/simulation.module#SimulationModule' },

            { path: 'community', loadChildren: '../community/community.module#CommunityModule' },

            { path: 'doc', loadChildren: '../document/document.module#DocumentModule' },

            { path: 'account', loadChildren: '../account/account.module#AccountModule'},
        ],
    },
];

export const routing = RouterModule.forChild(routs);
