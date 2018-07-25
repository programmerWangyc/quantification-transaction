import { Component } from '@angular/core';

import { Observable, Subject, Subscription } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { UtilService } from '../../providers/util.service';
import { BacktestChart, BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-backtest-chart',
    templateUrl: './backtest-chart.component.html',
    styleUrls: ['./backtest-chart.component.scss'],
})
export class BacktestChartComponent extends BaseComponent {
    /**
     * Chart source data; If multiple the type would be BacktestChart[], otherwise Highstock.Options;
     */
    data: Observable<BacktestChart[] | Highstock.Options>;

    /**
     * Receive the chart object the created by chart component;
     */
    chart$: Subject<Highstock.ChartObject> = new Subject();

    /**
     * @ignore
     */
    subscription$$: Subscription;

    constructor(
        public chartService: BacktestChartService,
        public utilService: UtilService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    initialModel() {
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.chart$.pipe(
            delay(50),
            map(this.utilService.createChartSize)
        ).subscribe(({ charts, width, height }) => (<Highcharts.ChartObject>charts).setSize(width, height));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
