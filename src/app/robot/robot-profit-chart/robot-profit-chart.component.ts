
import {map} from 'rxjs/operators';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable ,  Subject ,  Subscription } from 'rxjs';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { SemanticsLog } from '../robot.config';
import { RobotLogService } from './../providers/robot.log.service';

@Component({
    selector: 'app-robot-profit-chart',
    templateUrl: './robot-profit-chart.component.html',
    styleUrls: ['./robot-profit-chart.component.scss']
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
        this.options = this.robotLog.getProfitChartOptions();

        this.statistics = this.robotLog.getProfitChartStatistics();

        this.isShow = this.robotLog.hasProfitLogs();

        this.logTotal = this.robotLog.getLogsTotal(SemanticsLog.profitLog);

        this.pageSize = this.robotLog.getRobotLogDefaultParams().pipe(map(item => item.profitLimit));
    }

    launch() {
        const id = this.route.paramMap.pipe(map(param => +param.get('id')));

        this.subscription$$ = this.robotLog.addProfitPoints(this.chart$)
            .add(this.robotLog.launchRobotLogs(this.robotLog.getProfitOffset().withLatestFrom(id, (profitOffset, robotId) => ({ profitOffset, robotId })).skip(1)));
    }

    changePage(page) {
        this.robotLog.changeProfitChartPage(page);
    }

    ngOnDestroy() {
        this.subscription$$ && this.subscription$$.unsubscribe();
    }
}
