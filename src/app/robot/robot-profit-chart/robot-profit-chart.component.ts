import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';
import { map, skip, withLatestFrom } from 'rxjs/operators';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { RobotLogService } from '../providers/robot.log.service';
import { SemanticsLog } from '../robot.config';

@Component({
    selector: 'app-robot-profit-chart',
    templateUrl: './robot-profit-chart.component.html',
    styleUrls: ['./robot-profit-chart.component.scss'],
})
export class RobotProfitChartComponent extends FoldableBusinessComponent implements BaseComponent {

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    isFold = false;

    /**
     * Highstock chart options;
     */
    options: Observable<Highstock.Options>;

    /**
     * Statistics label;
     */
    statistics: Observable<string>;

    /**
     * Chart instances flow, comes from chart component;
     */
    chart$: Subject<Highstock.ChartObject> = new Subject();

    /**
     * Whether has profit logs
     */
    hasProfitLogs: Observable<boolean>;

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
        this.options = this.robotLog.getProfitChartOptions();

        this.statistics = this.robotLog.getProfitChartStatistics();

        this.hasProfitLogs = this.robotLog.hasProfitLogs();

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.profitLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().pipe(
            map(item => item.profitLimit)
        );
    }

    /**
     * @ignore
     */
    launch() {
        const id = this.route.paramMap.pipe(map(param => +param.get('id')));

        this.subscription$$ = this.robotLog.addProfitPoints(this.chart$)
            .add(this.robotLog.launchRobotLogs(this.robotLog.getProfitOffset().pipe(
                withLatestFrom(id, (profitOffset, robotId) => ({ profitOffset, robotId })),
                skip(1)
            )));
    }

    /**
     * Go to other page;
     */
    changePage(page) {
        this.robotLog.changeProfitChartPage(page);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$ && this.subscription$$.unsubscribe();
    }
}
