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

    subscription$$: Subscription;

    isFold = false;

    options: Observable<Highstock.Options>;

    statistics: Observable<string>;

    chart$: Subject<Highstock.ChartObject> = new Subject();

    isShow: Observable<boolean>;

    currentPage = 1;

    logTotal: Observable<number>;

    pageSize: Observable<number>;

    constructor(
        public eleRef: ElementRef,
        public render: Renderer2,
        private robotLog: RobotLogService,
        private route: ActivatedRoute,
    ) {
        super(render, eleRef);
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.options = this.robotLog.getProfitChartOptions();

        this.statistics = this.robotLog.getProfitChartStatistics();

        this.isShow = this.robotLog.hasProfitLogs();

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.profitLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().pipe(
            map(item => item.profitLimit)
        );
    }

    launch() {
        const id = this.route.paramMap.pipe(map(param => +param.get('id')));

        this.subscription$$ = this.robotLog.addProfitPoints(this.chart$)
            .add(this.robotLog.launchRobotLogs(this.robotLog.getProfitOffset()
                .pipe(
                    withLatestFrom(id, (profitOffset, robotId) => ({ profitOffset, robotId })),
                    skip(1)
                )
            ));
    }

    changePage(page) {
        this.robotLog.changeProfitChartPage(page);
    }

    ngOnDestroy() {
        this.subscription$$ && this.subscription$$.unsubscribe();
    }
}
