import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { bufferCount, delay, map, switchMap, tap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { UtilService } from '../../providers/util.service';
import { BacktestChart, BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-profit-lose',
    templateUrl: './profit-lose.component.html',
    styleUrls: ['./profit-lose.component.scss']
})
export class ProfitLoseComponent extends BaseComponent {
    data: Observable<BacktestChart[]>;

    charts: Observable<Highstock.ChartObject[]>;

    chart$: Subject<Highstock.ChartObject> = new Subject();

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
        this.data = this.chartService.getFloatPLChartOptions()
            .pipe(tap(v => console.log(v)))

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
            .subscribe(({ charts, width, height }) => charts.forEach(chart => chart.setSize(width, height)))

    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
