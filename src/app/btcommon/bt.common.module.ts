import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { ExchangeComponent } from './exchange/exchange.component';
import { KLinePeriodPipe } from './pipes/k-line-period.pipe';
import { RobotPublicStatusPipe, RobotStatusPipe } from './pipes/robot.pipe';
import { RobotService } from './providers/robot.service';
import { RobotConfigComponent } from './robot-config/robot-config.component';
import { RobotLogComponent } from './robot-log/robot-log.component';
import { RobotOverviewComponent } from './robot-overview/robot-overview.component';
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
        RobotPublicStatusPipe,
        RobotStatusPipe,
        KLinePeriodPipe,
        RobotOverviewComponent,
        RobotConfigComponent,
        RobotLogComponent,
    ],

    entryComponents: [
    ],

    providers: [
        RobotService,
    ],
    exports: [
        TrusteeComponent,
        StrategyLibComponent,
        ExchangeComponent,
        RobotComponent,
        RobotPublicStatusPipe,
        RobotStatusPipe,
        KLinePeriodPipe,
        RobotOverviewComponent,
        RobotConfigComponent,
        RobotLogComponent,
    ]
})
export class BtCommonModule { }
