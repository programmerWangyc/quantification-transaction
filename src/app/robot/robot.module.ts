import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'angular2-highcharts';

import { StrategyModule } from '../strategy/strategy.module';
import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { CreateRobotComponent } from './create-robot/create-robot.component';
import { DeleteRobotComponent } from './delete-robot/delete-robot.component';
import { ExchangePairComponent } from './exchange-pair/exchange-pair.component';
import { PIPES } from './pipes/index.pipes';
import { RobotLogService } from './providers/robot.log.service';
import { RobotOperateService } from './providers/robot.operate.service';
import { RobotService } from './providers/robot.service';
import { RobotCommandComponent } from './robot-command/robot-command.component';
import { RobotConfigComponent } from './robot-config/robot-config.component';
import { RobotListComponent } from './robot-list/robot-list.component';
import { RobotLogComponent } from './robot-log/robot-log.component';
import { RobotOverviewComponent } from './robot-overview/robot-overview.component';
import { RobotProfitChartComponent } from './robot-profit-chart/robot-profit-chart.component';
import { RobotStatusComponent } from './robot-status/robot-status.component';
import { RobotStrategyChartComponent } from './robot-strategy-chart/robot-strategy-chart.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RouterModule,
        ChartModule.forRoot(
            require('highcharts/highstock')
        ),
        StrategyModule,
    ],
    declarations: [
        CreateRobotComponent,
        DeleteRobotComponent,
        ExchangePairComponent,
        PIPES,
        RobotCommandComponent,
        RobotListComponent,
        RobotConfigComponent,
        RobotLogComponent,
        RobotOverviewComponent,
        RobotProfitChartComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
    ],

    entryComponents: [
        DeleteRobotComponent,
        CreateRobotComponent,
    ],

    providers: [
        RobotService,
        RobotLogService,
        RobotOperateService,
    ],
    exports: [
        CreateRobotComponent,
        DeleteRobotComponent,
        PIPES,
        RobotCommandComponent,
        RobotListComponent,
        RobotConfigComponent,
        RobotLogComponent,
        RobotOverviewComponent,
        RobotProfitChartComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class RobotModule { }