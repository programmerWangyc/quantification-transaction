import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { bufferCount, delay, map, switchMap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { UtilService } from '../../providers/util.service';
import { BacktestChart, BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-backtest-chart',
    templateUrl: './backtest-chart.component.html',
    styleUrls: ['./backtest-chart.component.scss']
})
export class BacktestChartComponent extends BaseComponent {
    data: Observable<BacktestChart[] | Highstock.Options>;

    charts: Observable<Highstock.ChartObject[]>;

    chart$: Subject<Highstock.ChartObject> = new Subject();

    subscription$$: Subscription;

    constructor(
        public chartService: BacktestChartService,
        public utilService: UtilService,
    ) {
        super();
    }

    ngOnInit() {
    }

    initialModel() {
        this.charts = this.data.pipe(
            switchMap(options => this.chart$.pipe(
                bufferCount((<BacktestChart[]>options).length)
            ))
        );
    }

    launch() {
        this.subscription$$ = (this.charts || this.chart$).pipe(
            delay(30),
            map(this.utilService.createChartSize)
        )
            .subscribe(({ charts, width, height }) => {
                if (this.charts) {
                    (<Highcharts.ChartObject[]>charts).forEach(chart => chart.setSize(width, height))
                } else {
                    (<Highcharts.ChartObject>charts).setSize(width, height);
                }
            });
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
