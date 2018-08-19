import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommentModule } from '../comment/comment.module';
import { SharedModule } from '../shared/shared.module';
import { FactRobotOverviewComponent } from './fact-robot-overview/fact-robot-overview.component';
import { FactRobotComponent } from './fact-robot/fact-robot.component';
import { routing } from './fact.routing';
import { FactComponent } from './fact/fact.component';
import { FactRobotTableComponent } from './fact-robot-table/fact.robot.table.component';
import { FactService } from './providers/fact.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        CommentModule,
        routing,
    ],
    declarations: [
        FactComponent,
        FactRobotTableComponent,
        FactRobotComponent,
        FactRobotOverviewComponent,
    ],
    exports: [
        FactComponent,
    ],
    providers: [
        FactService,
    ],
})
export class FactModule { }
