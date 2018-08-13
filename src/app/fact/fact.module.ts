import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommentModule } from '../comment/comment.module';
import { RobotModule } from '../robot/robot.module';
import { SharedModule } from '../shared/shared.module';
import { FactRobotOverviewComponent } from './fact-robot-overview/fact-robot-overview.component';
import { FactRobotComponent } from './fact-robot/fact-robot.component';
import { FactComponent } from './fact/fact.component';
import { RobotComponent } from './robot/robot.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        CommentModule,
        RobotModule,
        RouterModule,
    ],
    declarations: [
        FactComponent,
        RobotComponent,
        FactRobotComponent,
        FactRobotOverviewComponent,
    ],
    exports: [
        FactComponent,
    ],
})
export class FactModule { }
