import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';
import { bufferCount, delay, map, skip, switchMap, withLatestFrom } from 'rxjs/operators';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { UtilService } from '../../providers/util.service';
import { RobotLogService } from '../providers/robot.log.service';
import { SemanticsLog } from '../robot.config';

@Component({
    selector: 'app-robot-strategy-chart',
    templateUrl: './robot-strategy-chart.component.html',
    styleUrls: ['./robot-strategy-chart.component.scss'],
})
export class RobotStrategyChartComponent extends FoldableBusinessComponent implements BaseComponent {

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    isFold = false;

    /**
     * Strategy charts options;
     */
    options: Observable<Highcharts.Options[]>;

    /**
     * Statistics label;
     */
    statistics: Observable<string>;

    /**
     * Chart flow, emitted by chart component;
     */
    chart$: Subject<Highcharts.ChartObject> = new Subject();

    /**
     * Grouped chart flow;
     */
    charts: Observable<Highcharts.ChartObject[]>;

    /**
     * Whether has strategy chart;
     */
    hasStrategyChart: Observable<boolean>;

    /**
     * @ignore
     */
    currentPage = 1;

    /**
     * @ignore
     */
    logTotal: Observable<number>;

    /**
     * @ignore
     */
    pageSize: Observable<number>;

    constructor(
        public eleRef: ElementRef,
        public render: Renderer2,
        private robotLog: RobotLogService,
        private route: ActivatedRoute,
        private util: UtilService,
    ) {
        super(render, eleRef);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel() {
        this.options = this.robotLog.getStrategyChartOptions();

        this.statistics = this.robotLog.getStrategyChartStatistics();

        this.hasStrategyChart = this.robotLog.hasStrategyChart();

        // resize chart
        this.charts = this.options.pipe(
            switchMap(options => this.chart$.pipe(
                bufferCount(options.length)
            ))
        );

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.strategyLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().pipe(
            map(item => item.chartLimit)
        );
    }

    /**
     * @ignore
     */
    launch() {
        const id = this.route.paramMap.pipe(
            map(param => +param.get('id'))
        );

        this.subscription$$ = this.robotLog.updateStrategyCharts(this.charts)
            .add(this.charts.pipe(
                delay(30),
                map(this.util.createChartSize)
            ).subscribe(({ charts, width, height }) => (<Highcharts.ChartObject[]>charts).forEach(chart => chart.setSize(width, height))))
            .add(this.robotLog.launchRobotLogs(
                this.robotLog.getStrategyOffset().pipe(
                    withLatestFrom(
                        id,
                        (chartOffset, robotId) => ({
                            robotId,
                            chartOffset,
                            chartMinId: 0,
                            chartMaxId: 0,
                            chartUpdateBaseId: 0,
                            chartUpdateTime: 0,
                        })
                    ),
                    skip(1)
                )
            ));
    }

    /**
     * @ignore
     */
    changePage(page: number) {
        this.robotLog.changeStrategyChartPage(page);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.charts.subscribe(charts => charts.forEach(item => item.destroy()));

        this.subscription$$.unsubscribe();
    }
}
