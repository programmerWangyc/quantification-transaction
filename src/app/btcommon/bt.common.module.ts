import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { ExchangeComponent } from './exchange/exchange.component';
import { PIPES } from './pipes/index.pipes';
import { RobotLogService } from './providers/robot.log.service';
import { RobotOperateService } from './providers/robot.operate.service';
import { RobotService } from './providers/robot.service';
import { RobotArgComponent } from './robot-arg/robot-arg.component';
import { RobotCommandComponent } from './robot-command/robot-command.component';
import { RobotConfigComponent } from './robot-config/robot-config.component';
import { RobotLogComponent } from './robot-log/robot-log.component';
import { RobotOverviewComponent } from './robot-overview/robot-overview.component';
import { RobotStatusComponent } from './robot-status/robot-status.component';
import { RobotComponent } from './robot/robot.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';
import { TrusteeComponent } from './trustee/trustee.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RouterModule,
    ],
    declarations: [
        TrusteeComponent,
        StrategyLibComponent,
        ExchangeComponent,
        RobotComponent,
        RobotOverviewComponent,
        RobotConfigComponent,
        RobotLogComponent,
        RobotArgComponent,
        RobotCommandComponent,
        PIPES,
        RobotStatusComponent,
    ],

    entryComponents: [
    ],

    providers: [
        RobotService,
        RobotLogService,
        RobotOperateService,
    ],
    exports: [
        TrusteeComponent,
        StrategyLibComponent,
        ExchangeComponent,
        RobotComponent,
        RobotOverviewComponent,
        RobotConfigComponent,
        RobotLogComponent,
        RobotCommandComponent,
        RobotStatusComponent,
        PIPES,
    ]
})
export class BtCommonModule { }
