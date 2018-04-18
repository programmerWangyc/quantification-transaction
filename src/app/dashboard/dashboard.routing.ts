import { RouterModule, Routes } from '@angular/router';

import { ExchangeComponent } from '../btcommon/exchange/exchange.component';
import { RobotComponent } from '../btcommon/robot/robot.component';
import { StrategyLibComponent } from '../btcommon/strategy-lib/strategy-lib.component';
import { TrusteeComponent } from '../btcommon/trustee/trustee.component';
import { Path } from '../interfaces/constant.interface';
import { CommunityComponent } from './community/community.component';
import { DashboardComponent } from './dashboard.component';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { SquareComponent } from './square/square.component';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: Path.robot, component: RobotComponent },
            { path: Path.strategy, component: StrategyLibComponent },
            { path: Path.exchange, component: ExchangeComponent },
            { path: Path.trustee, component: TrusteeComponent },
            { path: Path.square, component: SquareComponent},
            { path: Path.community, component: CommunityComponent},
            { path: Path.doc, component: DocComponent},
            { path: Path.fact, component: FactComponent},
            { path: '', redirectTo: Path.robot, pathMatch: 'full' },
        ]
    },
];

export const routing = RouterModule.forChild(routs);