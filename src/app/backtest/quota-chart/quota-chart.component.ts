import { Component } from '@angular/core';

import { UtilService } from '../../providers/util.service';
import { BacktestChartComponent } from '../backtest-chart/backtest-chart.component';
import { BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-quota-chart',
    templateUrl: './quota-chart.component.html',
    styleUrls: ['./quota-chart.component.scss']
})
export class QuotaChartComponent extends BacktestChartComponent {
    constructor(
        public chartService: BacktestChartService,
        public utilService: UtilService,
    ) {
        super(chartService, utilService);
    }

    ngOnInit() {
        this.data = this.chartService.getQuotaChartOptions();

        this.initialModel();

        this.launch();
    }
}
