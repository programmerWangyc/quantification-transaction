import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { ToolModule } from './../tool/tool.module';
import { ExchangeComponent } from './exchange/exchange.component';
import { RobotPublicStatusPipe, RobotStatusPipe } from './pipes/robot.pipe';
import { RobotService } from './providers/robot.service';
import { RobotComponent, RobotPublishConfirmComponent } from './robot/robot.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';
import { TrusteeComponent } from './trustee/trustee.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
    ],
    declarations: [
        TrusteeComponent,
        StrategyLibComponent,
        ExchangeComponent,
        RobotComponent,
        RobotPublishConfirmComponent,
        RobotPublicStatusPipe,
        RobotStatusPipe,
    ],

    entryComponents: [
        RobotPublishConfirmComponent,
    ],

    providers: [
        RobotService,
    ]
})
export class BtCommonModule { }
