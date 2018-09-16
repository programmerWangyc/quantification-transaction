import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { combineLatest, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { Robot, RobotStatus } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { RobotService } from '../providers/robot.service';

@Component({
    selector: 'app-robot-duration',
    templateUrl: './robot-duration.component.html',
    styleUrls: ['./robot-duration.component.scss'],
})
export class RobotDurationComponent implements OnInit, OnDestroy {

    @Output() info: EventEmitter<string> = new EventEmitter();

    balance: Observable<number>;

    consumed: Observable<number>;

    unit = 'YUAN';

    runningRobotCount: Observable<number>;

    robotTotal: Observable<number>;

    grossProfit: Observable<number>;

    strategyTotal: Observable<number>;

    agentTotal: Observable<number>;

    exchangeTotal: Observable<number>;

    isAlive = true;

    constructor(
        private publicService: PublicService,
        private robotService: RobotService,
        private translate: TranslateService,
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    launch() {
        this.publicService.launchAccountSummary(of(null));

        this.publicService.handleAccountSummaryError(() => this.isAlive);

        const predicate = (robot: Robot) => !robot.is_sandbox && this.robotService.isNormalStatus(robot);

        const availableRobotCount = this.robotService.getRobotCountByStatus(predicate).pipe(
            map(robots => Math.max(1, robots.length))
        );

        // const availableHours = availableRobotCount
        //     .pipe(
        //         withLatestFrom(
        //             this.publicService.getBalance(),
        //             (count, balance) => (balance / 1e8 / count / 0.125).toFixed(2)
        //         ),
        // )

        // const deadline = this.robotService.getRobotDeadLine();

        combineLatest(
            availableRobotCount,
            this.publicService.getBalance(),
            this.robotService.getRobotDeadLine()
        ).pipe(
            map(([count, balance, datetime]) => ({ count, hours: (balance / 1e8 / count / 0.125).toFixed(2), datetime })),
            mergeMap(data => this.translate.get('ROBOTS_AVAILABLE_STATE_STATISTICS', data))
        ).subscribe(info => this.info.next(info));
    }

    initialModel() {
        this.balance = this.publicService.getBalance();

        this.consumed = this.publicService.getConsumed();

        this.runningRobotCount = this.robotService.getRobotCountByStatus((robot: Robot) => robot.status === RobotStatus.RUNNING).pipe(map(robots => robots.length));

        this.robotTotal = this.robotService.getRobots().pipe(
            map(robots => robots.length)
        );

        this.grossProfit = this.robotService.getGrossProfit();

        const summary = this.publicService.getAccountSummary();

        this.strategyTotal = summary.pipe(
            map(({ strategy, premium_strategy }) => strategy + premium_strategy)
        );

        this.agentTotal = summary.pipe(
            map(({ node }) => node)
        );

        this.exchangeTotal = summary.pipe(
            map(({ platform }) => platform)
        );
    }

    ngOnDestroy() {
        this.isAlive = false;
    }
}
