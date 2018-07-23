import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BacktestChartService } from '../providers/backtest.chart.service';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-result',
    templateUrl: './backtest-result.component.html',
    styleUrls: ['./backtest-result.component.scss']
})
export class BacktestResultComponent implements OnInit {
    /**
     * Whether show backtest dashboard;
     */
    @Input() isDashboardDisplay = false;

    /**
     * Whether the backtest is optimized or not;
     */
    isOptimizeBacktest: Observable<boolean>;

    /**
     * Whether show quota chart;
     */
    isQuoteDisplay: Observable<boolean>;

    /**
     * Whether show floating profit and lose chart;
     */
    isFloatingPLDisplay: Observable<boolean>;

    /**
     * Whether show profit curve chart;
     */
    isProfitCurveDisplay: Observable<boolean>;

    /**
     * Whether show strategy charts;
     */
    isStrategyChartsDisplay: Observable<boolean>;

    /**
     * Whether has backtest result;
     */
    hasResult: Observable<boolean>;

    constructor(
        private backtestService: BacktestService,
        private chartService: BacktestChartService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.isOptimizeBacktest = this.backtestService.isOptimizeBacktest();

        this.isQuoteDisplay = this.chartService.hasQuotaChart();

        this.isFloatingPLDisplay = this.chartService.hasFloatPLChart();

        this.isProfitCurveDisplay = this.chartService.hasProfitCurveChart();

        this.isStrategyChartsDisplay = this.chartService.hasStrategyCharts();

        this.hasResult = this.chartService.getBacktestResult().pipe(
            map(res => !!res)
        );
    }

}
