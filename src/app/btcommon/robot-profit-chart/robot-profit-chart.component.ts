import { Component, ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { RobotLogService } from './../providers/robot.log.service';

@Component({
    selector: 'app-robot-profit-chart',
    templateUrl: './robot-profit-chart.component.html',
    styleUrls: ['./robot-profit-chart.component.scss']
})
export class RobotProfitChartComponent extends BusinessComponent {

    subscription$$: Subscription;

    isFold = false;

    options: Observable<Highstock.Options>;

    statistics: Observable<string>;

    chart: Highstock.ChartObject;

    constructor(
        public eleRef: ElementRef,
        public render: Renderer2,
        private robotLog: RobotLogService,
        private translate: TranslateService,
    ) {
        super(render, eleRef);
    }

    ngOnInit() {
        this.initialModel();
    }

    initialModel() {
        this.options = this.robotLog.getProfitChartOptions();

        this.statistics = this.robotLog.getProfitChartTotal()
            .withLatestFrom(this.robotLog.getProfitMaxPoint())
            .mergeMap(([total, limit]) => this.translate.get('PAGINATION_STATISTICS', { total, page: Math.ceil(total / limit) }))
    }

    launch() {
        this.subscription$$ = this.robotLog.addProfitPoints(this.chart);
    }

    initialChart(chart: Highstock.ChartObject) {
        this.chart = chart;

        this.launch();
    }

    toggleFold() {
        this.isFold = !this.isFold;

        this.toggle(this.isFold);
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
