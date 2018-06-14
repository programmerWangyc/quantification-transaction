import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RobotModule } from '../robot/robot.module';
import { SharedModule } from '../shared/shared.module';
import { StrategyModule } from '../strategy/strategy.module';
import { ToolModule } from '../tool/tool.module';
import { AdvancedOptionsComponent } from './advanced-options/advanced-options.component';
import { ArgOptimizerComponent } from './arg-optimizer/arg-optimizer.component';
import { BacktestStrategyArgsComponent } from './backtest-strategy-args/backtest-strategy-args.component';
import { DispenseOptionsComponent } from './dispense-options/dispense-options.component';
import { ExchangeOptionsComponent } from './exchange-options/exchange-options.component';
import { PIPES } from './pipes/index.pipe';
import { BacktestConstantService } from './providers/backtest.constant.service';
import { BacktestService } from './providers/backtest.service';
import { TimeOptionsComponent } from './time-options/time-options.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RobotModule,
        StrategyModule,
    ],
    declarations: [
        TimeOptionsComponent,
        AdvancedOptionsComponent,
        ExchangeOptionsComponent,
        DispenseOptionsComponent,
        BacktestStrategyArgsComponent,
        ArgOptimizerComponent,
        PIPES,
    ],

    providers: [
        BacktestService,
        BacktestConstantService,
    ],

    exports: [
        TimeOptionsComponent,
        AdvancedOptionsComponent,
        ExchangeOptionsComponent,
        DispenseOptionsComponent,
        BacktestStrategyArgsComponent,
    ]

})
export class BacktestModule { }
