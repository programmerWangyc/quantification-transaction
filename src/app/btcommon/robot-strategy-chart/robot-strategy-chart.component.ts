import { Component, ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { RobotLogService } from '../providers/robot.log.service';

@Component({
    selector: 'app-robot-strategy-chart',
    templateUrl: './robot-strategy-chart.component.html',
    styleUrls: ['./robot-strategy-chart.component.scss']
})
export class RobotStrategyChartComponent extends BusinessComponent {

    subscription$$: Subscription;

    isFold = false;

    chart: Highcharts.ChartObject;

    options: Observable<Highcharts.Options[]>;

    statistics: Observable<string>;

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
        this.options = this.robotLog.getStrategyChartOptions();

        this.statistics = this.robotLog.getStrategyChartTotal()
            .withLatestFrom(this.robotLog.getStrategyMaxPoint(), this.robotLog.getStrategyUpdateTime())
            .mergeMap(([total, limit, time]) => this.translate.get('PAGINATION_STATISTICS_WITH_UPDATE_TIME', { total, page: Math.ceil(total / limit), time }))
    }

    launch() {

    }

    initialChart(chart: Highcharts.ChartObject) {
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
