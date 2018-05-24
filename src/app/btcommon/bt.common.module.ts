import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'angular2-highcharts';

import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { CreateRobotComponent } from './create-robot/create-robot.component';
import { DeleteRobotComponent } from './delete-robot/delete-robot.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { PIPES } from './pipes/index.pipes';
import { RobotLogService } from './providers/robot.log.service';
import { RobotOperateService } from './providers/robot.operate.service';
import { RobotService } from './providers/robot.service';
import { StrategyService } from './providers/strategy.service';
import { StrategyArgComponent } from './strategy-arg/strategy-arg.component';
import { RobotCommandComponent } from './robot-command/robot-command.component';
import { RobotConfigComponent } from './robot-config/robot-config.component';
import { RobotLogComponent } from './robot-log/robot-log.component';
import { RobotOverviewComponent } from './robot-overview/robot-overview.component';
import { RobotProfitChartComponent } from './robot-profit-chart/robot-profit-chart.component';
import { RobotStatusComponent } from './robot-status/robot-status.component';
import { RobotStrategyChartComponent } from './robot-strategy-chart/robot-strategy-chart.component';
import { RobotComponent } from './robot/robot.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';
import { TrusteeComponent } from './trustee/trustee.component';
import { ExchangePairComponent } from './exchange-pair/exchange-pair.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RouterModule,
        ChartModule.forRoot(
            require('highcharts/highstock')
        ),
    ],
    declarations: [
        TrusteeComponent,
        StrategyLibComponent,
        ExchangeComponent,
        RobotComponent,
        RobotOverviewComponent,
        RobotConfigComponent,
        RobotLogComponent,
        StrategyArgComponent,
        RobotCommandComponent,
        RobotStatusComponent,
        RobotStrategyChartComponent,
        RobotProfitChartComponent,
        PIPES,
        DeleteRobotComponent,
        CreateRobotComponent,
        ExchangePairComponent,
    ],

    entryComponents: [
        DeleteRobotComponent,
        CreateRobotComponent,
    ],

    providers: [
        RobotService,
        RobotLogService,
        RobotOperateService,
        StrategyService,
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
        RobotStrategyChartComponent,
        RobotProfitChartComponent,
        PIPES,
        DeleteRobotComponent,
        CreateRobotComponent,
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class BtCommonModule { }
