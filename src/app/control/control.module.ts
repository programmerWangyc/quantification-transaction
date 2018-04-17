import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';
import { ExchangeComponent } from './exchange/exchange.component';
import { RobotComponent } from './robot/robot.component';
import { StrategyLibComponent } from './strategy-lib/strategy-lib.component';
import { TrusteeComponent } from './trustee/trustee.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule,
    ],
    declarations: [
        TrusteeComponent,
        StrategyLibComponent,
        ExchangeComponent,
        RobotComponent
    ]
})
export class ControlModule { }
