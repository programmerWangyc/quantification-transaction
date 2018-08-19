import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ChartModule } from 'angular2-highcharts';

import { SharedModule } from '../shared/shared.module';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AdvancedOptionsComponent } from './advanced-options/advanced-options.component';
import { ArgOptimizerComponent } from './arg-optimizer/arg-optimizer.component';
import { BacktestChartComponent } from './backtest-chart/backtest-chart.component';
import { BacktestLogInfoComponent } from './backtest-log-info/backtest-log-info.component';
import { BacktestLogComponent } from './backtest-log/backtest-log.component';
import { BacktestResultComponent } from './backtest-result/backtest-result.component';
import { BacktestSimulationComponent } from './backtest-simulation/backtest-simulation.component';
import { BacktestStatusComponent } from './backtest-status/backtest-status.component';
import { BacktestStrategyArgsComponent } from './backtest-strategy-args/backtest-strategy-args.component';
import { BacktestStrategyChartComponent } from './backtest-strategy-chart/backtest-strategy-chart.component';
import { DispenseOptionsComponent } from './dispense-options/dispense-options.component';
import { ExchangeOptionsComponent } from './exchange-options/exchange-options.component';
import { PIPES } from './pipes/index.pipe';
import { ProfitCurveComponent } from './profit-curve/profit-curve.component';
import { ProfitLoseComponent } from './profit-lose/profit-lose.component';
import { BacktestChartService } from './providers/backtest.chart.service';
import { BacktestComputingService } from './providers/backtest.computing.service';
import { BacktestConstantService } from './providers/backtest.constant.service';
import { BacktestSandboxService } from './providers/backtest.sandbox.service';
import { BacktestService } from './providers/backtest.service';
import { QuotaChartComponent } from './quota-chart/quota-chart.component';
import { TimeOptionsComponent } from './time-options/time-options.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ChartModule.forRoot(
            require('highcharts/highstock'),
            require('../plugins/exporting.js'),
            require('../plugins/offline-exporting.js'),
        ),
    ],
    declarations: [
        AccountInfoComponent,
        AdvancedOptionsComponent,
        ArgOptimizerComponent,
        BacktestChartComponent,
        BacktestLogComponent,
        BacktestLogInfoComponent,
        BacktestResultComponent,
        BacktestStatusComponent,
        BacktestStrategyArgsComponent,
        BacktestStrategyChartComponent,
        BacktestSimulationComponent,
        DispenseOptionsComponent,
        ExchangeOptionsComponent,
        PIPES,
        ProfitCurveComponent,
        ProfitLoseComponent,
        QuotaChartComponent,
        TimeOptionsComponent,
    ],

    providers: [
        BacktestChartService,
        BacktestComputingService,
        BacktestConstantService,
        BacktestSandboxService,
        BacktestService,
    ],

    exports: [
        BacktestSimulationComponent,
    ],
})
export class BacktestModule { }
