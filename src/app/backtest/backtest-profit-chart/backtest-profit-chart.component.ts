import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { bufferCount, delay, map, switchMap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { UtilService } from '../../providers/util.service';
import { BacktestChart, BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-backtest-profit-chart',
    templateUrl: './backtest-profit-chart.component.html',
    styleUrls: ['./backtest-profit-chart.component.scss']
})
export class BacktestProfitChartComponent extends BaseComponent {
    data: Observable<BacktestChart[]>;

    charts: Observable<Highcharts.ChartObject[]>;

    chart$: Subject<Highcharts.ChartObject> = new Subject();

    subscription$$: Subscription;

    constructor(
        private chartService: BacktestChartService,
        private utilService: UtilService,
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.data = this.chartService.getQuotaChartOptions();

        this.charts = this.data.pipe(
            switchMap(options => this.chart$.pipe(
                bufferCount(options.length)
            ))
        );
    }

    launch() {
        this.subscription$$ = this.charts.pipe(
            delay(30),
            map(this.utilService.createChartSize)
        )
            .subscribe(({ charts, width, height }) => (<Highcharts.ChartObject[]>charts).forEach(chart => chart.setSize(width, height)))

    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
