import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { ChargeModule } from '../charge/charge.module';
import { RobotModule } from '../robot/robot.module';
import { DASHBOARD_EFFECTS } from '../store/index.effect';
import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { CommunityComponent } from './community/community.component';
import { DashboardComponent } from './dashboard.component';
import { routing } from './dashboard.routing';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotComponent } from './robot/robot.component';
import { SquareComponent } from './square/square.component';
import { RechargeComponent } from './recharge/recharge.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RobotModule,
        routing,
        EffectsModule.forFeature(DASHBOARD_EFFECTS),
        ToolModule,
        ChargeModule,
    ],
    declarations: [
        DashboardComponent,
        SquareComponent,
        CommunityComponent,
        DocComponent,
        FactComponent,
        RobotDetailComponent,
        RobotComponent,
        RobotCreationComponent,
        RechargeComponent,
    ],
})
export class DashboardModule { }
