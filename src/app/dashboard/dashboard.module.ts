import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import { RobotEffect } from '../store/robot/robot.effect';
import { BtCommonModule } from './../btcommon/bt.common.module';
import { SharedModule } from './../shared/shared.module';
import { CommunityComponent } from './community/community.component';
import { ContainerComponent } from './container/container.component';
import { routing } from './dashboard.routing';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocComponent } from './doc/doc.component';
import { FactComponent } from './fact/fact.component';
import { SquareComponent } from './square/square.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        BtCommonModule,
        routing, 
        EffectsModule.forFeature([RobotEffect]),
    ],
    declarations: [
        DashboardComponent,
        SquareComponent,
        CommunityComponent,
        DocComponent,
        FactComponent,
        ContainerComponent
    ],
})
export class DashboardModule { }
