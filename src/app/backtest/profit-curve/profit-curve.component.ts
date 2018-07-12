import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { UtilService } from '../../providers/util.service';
import { BacktestChartService } from '../providers/backtest.chart.service';

@Component({
    selector: 'app-profit-curve',
    templateUrl: './profit-curve.component.html',
    styleUrls: ['./profit-curve.component.scss']
})
export class ProfitCurveComponent extends BaseComponent {

    data: Observable<Highstock.Options>;

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
        this.data = this.chartService.getProfitCurveOptions()
            .pipe(
                tap(v => console.log(v))
            )
    }

    launch() {
        this.subscription$$ = this.chart$.pipe(
            delay(30),
            map(this.utilService.createChartSize)
        )
            .subscribe(({ charts, width, height }) => (<Highcharts.ChartObject>charts).setSize(width, height))

    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
