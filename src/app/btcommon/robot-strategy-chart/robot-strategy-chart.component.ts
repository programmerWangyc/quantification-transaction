import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { RobotLogService } from '../providers/robot.log.service';
import { SemanticsLog } from './../../interfaces/constant.interface';

@Component({
    selector: 'app-robot-strategy-chart',
    templateUrl: './robot-strategy-chart.component.html',
    styleUrls: ['./robot-strategy-chart.component.scss'],
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

    currentPage = 1;

    logTotal: Observable<number>;

    pageSize: Observable<number>;

    constructor(
        public eleRef: ElementRef,
        public render: Renderer2,
        private robotLog: RobotLogService,
        private translate: TranslateService,
        private route: ActivatedRoute,
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

        this.charts = this.options.switchMap(options => this.chart$.bufferCount(options.length));

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.strategyLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().map(item => item.chartLimit);
    }

    launch() {
        const id = this.route.paramMap.map(param => +param.get('id'));

        this.subscription$$ = this.robotLog.updateStrategyCharts(this.charts)
            .add(this.robotLog.launchRobotLogs(
                this.robotLog.getStrategyOffset()
                    .withLatestFrom(
                        id,
                        (chartOffset, robotId) => ({
                            robotId,
                            chartOffset,
                            chartMinId: 0,
                            chartMaxId: 0,
                            chartUpdateBaseId: 0,
                            chartUpdateTime: 0,
                        })
                    )
                    .skip(1))
            );
    }

    toggleFold() {
        this.isFold = !this.isFold;

        this.toggle(this.isFold);
    }

    changePage(page: number) {
        this.robotLog.changeStrategyChartPage(page);
    }

    ngOnDestroy() {
        this.charts.subscribe(charts => charts.forEach(item => item.destroy()));

        this.subscription$$.unsubscribe();
    }
}
