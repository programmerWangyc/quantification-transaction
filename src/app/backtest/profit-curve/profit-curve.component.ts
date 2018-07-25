import { Component } from '@angular/core';

import { UtilService } from '../../providers/util.service';
import { BacktestChartComponent } from '../backtest-chart/backtest-chart.component';
import { BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-profit-curve',
    templateUrl: './profit-curve.component.html',
    styleUrls: ['./profit-curve.component.scss'],
})
export class ProfitCurveComponent extends BacktestChartComponent {

    constructor(
        public chartService: BacktestChartService,
        public utilService: UtilService,
    ) {
        super(chartService, utilService);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.data = this.chartService.getProfitCurveOptions();

        this.launch();
    }
}
