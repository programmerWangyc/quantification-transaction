import { Component } from '@angular/core';

import { UtilService } from '../../providers/util.service';
import { BacktestChartService } from '../providers/backtest.chart.service';
import { BacktestChartComponent } from './../backtest-chart/backtest-chart.component';

@Component({
    selector: 'app-profit-lose',
    templateUrl: './profit-lose.component.html',
    styleUrls: ['./profit-lose.component.scss']
})
export class ProfitLoseComponent extends BacktestChartComponent {
    constructor(
        public chartService: BacktestChartService,
        public utilService: UtilService,
    ) {
        super(chartService, utilService);
    }

    ngOnInit() {
        this.data = this.chartService.getFloatPLChartOptions();

        this.initialModel();

        this.launch();
    }
}
