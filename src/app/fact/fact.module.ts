import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommentModule } from '../comment/comment.module';
import { RobotModule } from '../robot/robot.module';
import { SharedModule } from '../shared/shared.module';
import { FactComponent } from './fact/fact.component';
import { PIPES } from './pipes/index.pipe';
import {
    RobotComponent, RobotInfoComponent, RobotInnerTableComponent, RobotSubtitleComponent
} from './robot/robot.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        CommentModule,
        RobotModule,
    ],
    declarations: [
        FactComponent,
        PIPES,
        RobotComponent,
        RobotSubtitleComponent,
        RobotInnerTableComponent,
        RobotInfoComponent,
    ],
    exports: [
        FactComponent,
        PIPES,
    ],
})
export class FactModule { }
