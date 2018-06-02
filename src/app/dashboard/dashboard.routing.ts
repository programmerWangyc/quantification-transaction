import { RouterModule, Routes } from '@angular/router';

import { Path } from '../app.config';
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
            { path: Path.robot, component: RobotComponent },
            { path: Path.robot + '/' + Path.createRobot, component: RobotCreationComponent },
            { path: Path.robot + '/:id/:name', component: RobotDetailComponent },
            { path: Path.robot + '/' + Path.debug, component: RobotDebugComponent },
            { path: Path.strategy, component: StrategyComponent },
            { path: Path.strategy + '/' + Path.copy + '/:id', component: StrategyCopyComponent },
            { path: Path.strategy + '/' + Path.edit + '/:id', component: StrategyEditComponent },
            { path: Path.strategy + '/' + Path.backtest + '/:id', component: DocComponent },
            // { path: Path.strategy + '/:id/:name', component: StrategyLibComponent },
            { path: Path.strategy + '/' + Path.verify + '/:id/:codeType', component: StrategyVerifyCodeComponent },
            { path: Path.strategy + '/' + Path.rent + '/:id', component: StrategyRentComponent },
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
