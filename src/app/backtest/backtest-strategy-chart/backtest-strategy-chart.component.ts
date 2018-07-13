import { Component } from '@angular/core';

import { BacktestChartService } from '../providers/backtest.chart.service';
import { UtilService } from './../../providers/util.service';
import { BacktestChartComponent } from './../backtest-chart/backtest-chart.component';

@Component({
    selector: 'app-backtest-strategy-chart',
    templateUrl: './backtest-strategy-chart.component.html',
    styleUrls: ['./backtest-strategy-chart.component.scss']
})
export class BacktestStrategyChartComponent extends BacktestChartComponent {
    constructor(
        public chartService: BacktestChartService,
        public utilService: UtilService,
    ) {
        super(chartService, utilService);
    }

    ngOnInit() {
        this.data = this.chartService.getStrategyChartOptions();

        this.initialModel();

        this.launch();
    }
}
