import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CreateRobotComponent } from './create-robot/create-robot.component';
import { DeleteRobotComponent } from './delete-robot/delete-robot.component';
import { PIPES } from './pipes/index.pipe';
import { RobotConstantService } from './providers/robot.constant.service';
import { RobotOperateService } from './providers/robot.operate.service';
import { RobotService } from './providers/robot.service';
import { RobotCommandComponent } from './robot-command/robot-command.component';
import { RobotConfigComponent } from './robot-config/robot-config.component';
import { RobotCreationComponent } from './robot-creation/robot-creation.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotDebuggerComponent } from './robot-debugger/robot-debugger.component';
import { RobotDetailComponent } from './robot-detail/robot-detail.component';
import { RobotDurationComponent } from './robot-duration/robot-duration.component';
import { RobotListComponent } from './robot-list/robot-list.component';
import { RobotOverviewComponent } from './robot-overview/robot-overview.component';
import { routing } from './robot.routing';
import { RobotComponent } from './robot/robot.component';
import { StrategyArgComponent } from './strategy-arg/strategy-arg.component';
import { RobotStrategyService } from './providers/robot.strategy.service';
import { RobotGuard } from './providers/guard.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        routing,
    ],
    declarations: [
        CreateRobotComponent,
        DeleteRobotComponent,
        PIPES,
        RobotCommandComponent,
        RobotComponent,
        RobotConfigComponent,
        RobotCreationComponent,
        RobotDebugComponent,
        RobotDebuggerComponent,
        RobotDetailComponent,
        RobotDurationComponent,
        RobotListComponent,
        RobotOverviewComponent,
        StrategyArgComponent,
    ],

    entryComponents: [
        CreateRobotComponent,
        DeleteRobotComponent,
    ],

    providers: [
        RobotConstantService,
        RobotGuard,
        RobotOperateService,
        RobotService,
        RobotStrategyService,
    ],
})
export class RobotModule { }
