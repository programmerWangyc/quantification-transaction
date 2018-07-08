import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RobotModule } from '../robot/robot.module';
import { SharedModule } from '../shared/shared.module';
import { StrategyModule } from '../strategy/strategy.module';
import { ToolModule } from '../tool/tool.module';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AdvancedOptionsComponent } from './advanced-options/advanced-options.component';
import { ArgOptimizerComponent } from './arg-optimizer/arg-optimizer.component';
import { BacktestLogComponent } from './backtest-log/backtest-log.component';
import { BacktestStatusComponent } from './backtest-status/backtest-status.component';
import { BacktestStrategyArgsComponent } from './backtest-strategy-args/backtest-strategy-args.component';
import { DispenseOptionsComponent } from './dispense-options/dispense-options.component';
import { ExchangeOptionsComponent } from './exchange-options/exchange-options.component';
import { PIPES } from './pipes/index.pipe';
import { BacktestComputingService } from './providers/backtest.computing.service';
import { BacktestConstantService } from './providers/backtest.constant.service';
import { BacktestParamService } from './providers/backtest.param.service';
import { BacktestResultService } from './providers/backtest.result.service';
import { BacktestService } from './providers/backtest.service';
import { TimeOptionsComponent } from './time-options/time-options.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ToolModule,
        RobotModule,
        StrategyModule,
        // WorkerAppModule,
    ],
    declarations: [
        AccountInfoComponent,
        AdvancedOptionsComponent,
        ArgOptimizerComponent,
        BacktestLogComponent,
        BacktestStatusComponent,
        BacktestStrategyArgsComponent,
        DispenseOptionsComponent,
        ExchangeOptionsComponent,
        PIPES,
        TimeOptionsComponent,
    ],

    providers: [
        BacktestComputingService,
        BacktestConstantService,
        BacktestParamService,
        BacktestResultService,
        BacktestService,
    ],

    exports: [
        AccountInfoComponent,
        AdvancedOptionsComponent,
        BacktestLogComponent,
        BacktestStatusComponent,
        BacktestStrategyArgsComponent,
        DispenseOptionsComponent,
        ExchangeOptionsComponent,
        TimeOptionsComponent,
    ]

})
export class BacktestModule { }
