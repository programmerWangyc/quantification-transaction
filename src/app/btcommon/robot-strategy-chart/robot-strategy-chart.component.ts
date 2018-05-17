import { Component, ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
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

    chart$: Subject<Highcharts.ChartObject> = new Subject();

    charts: Observable<Highcharts.ChartObject[]>;

    isShow: Observable<boolean>;

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

        this.launch();
    }

    initialModel() {
        this.options = this.robotLog.getStrategyChartOptions();

        this.statistics = this.robotLog.getStrategyChartStatistics();

        this.isShow = this.robotLog.hasStrategyChart();

        this.charts = this.chart$.scan((acc, cur) => [...acc, cur], [])
            .withLatestFrom(this.options.map(options => options.length).take(1))
            .filter(([charts, length]) => charts.length === length)
            .map(([charts, _]) => charts);

    }

    launch() {
        this.subscription$$ = this.robotLog.updateStrategyCharts(this.charts);
    }

    toggleFold() {
        this.isFold = !this.isFold;

        this.toggle(this.isFold);
    }

    ngOnDestroy() {
        this.charts.subscribe(charts => charts.forEach(item => item.destroy()));
        
        this.subscription$$.unsubscribe();
    }

}
