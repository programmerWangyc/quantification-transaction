import { RouterModule, Routes } from '@angular/router';

import { ContainerComponent as Community } from '../community/container/container.component';
import { ExchangeComponent } from '../control/exchange/exchange.component';
import { RobotComponent } from '../control/robot/robot.component';
import { StrategyLibComponent } from '../control/strategy-lib/strategy-lib.component';
import { TrusteeComponent } from '../control/trustee/trustee.component';
import { ContainerComponent as Doc } from '../document/container/container.component';
import { ContainerComponent as Fact } from '../fact/container/container.component';
import { Path } from '../interfaces/constant.interface';
import { ContainerComponent as Square } from '../square/container/container.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: Path.robot, component: RobotComponent },
            { path: Path.strategy, component: StrategyLibComponent },
            { path: Path.exchange, component: ExchangeComponent },
            { path: Path.trustee, component: TrusteeComponent },
            { path: Path.square, component: Square },
            { path: Path.fact, component: Fact},
            { path: Path.community, component: Community},
            { path: Path.doc, component: Doc },
            { path: '', redirectTo: 'robot', pathMatch: 'full' },
        ]
    },
];

export const routing = RouterModule.forChild(routs);