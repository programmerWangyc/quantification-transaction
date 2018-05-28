import { RouterModule, Routes } from '@angular/router';

import { Path } from '../interfaces/constant.interface';
import { StrategyLibComponent } from '../strategy/strategy-lib/strategy-lib.component';
import { CommunityComponent } from './community/community.component';
import { DashboardComponent } from './dashboard.component';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { RechargeComponent } from './recharge/recharge.component';
import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotComponent } from './robot/robot.component';
import { SquareComponent } from './square/square.component';

const routs: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            { path: Path.robot, component: RobotComponent },
            { path: Path.robot + '/' + Path.createRobot, component: RobotCreationComponent },
            { path: Path.robot + '/:id/:name', component: RobotDetailComponent },
            { path: Path.robot + '/' + Path.debug, component: RobotDebugComponent },
            { path: Path.strategy, component: StrategyLibComponent },
            { path: Path.charge, component: RechargeComponent },
            // { path: Path.exchange, component: ExchangeComponent },
            // { path: Path.trustee, component: TrusteeComponent },
            { path: Path.square, component: SquareComponent },
            { path: Path.community, component: CommunityComponent },
            { path: Path.doc, component: DocComponent },
            { path: Path.fact, component: FactComponent },
            { path: '', redirectTo: Path.robot, pathMatch: 'full' },
        ]
    },
];

export const routing = RouterModule.forChild(routs);
