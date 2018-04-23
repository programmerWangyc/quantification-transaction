import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { DASHBOARD_EFFECTS } from '../store/index.effect';
import { BtCommonModule } from './../btcommon/bt.common.module';
import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { CommunityComponent } from './community/community.component';
import { DashboardComponent } from './dashboard.component';
import { routing } from './dashboard.routing';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { SquareComponent } from './square/square.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        BtCommonModule,
        routing,
        EffectsModule.forFeature(DASHBOARD_EFFECTS),
        ToolModule,
    ],
    declarations: [
        DashboardComponent,
        SquareComponent,
        CommunityComponent,
        DocComponent,
        FactComponent,
        RobotDetailComponent,
    ],
})
export class DashboardModule { }
