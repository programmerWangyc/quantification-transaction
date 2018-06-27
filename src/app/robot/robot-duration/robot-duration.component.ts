
import {map} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { Robot, RobotStatus } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { RobotService } from '../providers/robot.service';

@Component({
    selector: 'app-robot-duration',
    templateUrl: './robot-duration.component.html',
    styleUrls: ['./robot-duration.component.scss']
})
export class RobotDurationComponent implements OnInit {

    info: Observable<string>;

    balance: Observable<number>;

    consumed: Observable<number>;

    unit = 'YUAN';

    runningRobotCount: Observable<number>;

    robotTotal: Observable<number>;

    grossProfit: Observable<number>;

    constructor(
        private publicService: PublicService,
        private robotService: RobotService,
        private translate: TranslateService,
    ) { }

    ngOnInit() {
        const predicate = (robot: Robot) => !robot.is_sandbox && this.robotService.isNormalStatus(robot);

        const availableRobotCount = this.robotService.getRobotCountByStatus(predicate).pipe(map(robots => Math.max(1, robots.length)));

        const availableHours = availableRobotCount.withLatestFrom(
            this.publicService.getBalance(),
            (count, balance) => (balance / 1e8 / count / 0.125).toFixed(2)
        );

        const deadline = this.robotService.getRobotDeadLine();

        this.info = availableRobotCount.combineLatest(
            this.publicService.getBalance(),
            this.robotService.getRobotDeadLine(),
            (count, balance, datetime) => ({ count, hours: (balance / 1e8 / count / 0.125).toFixed(2), datetime })
        ).mergeMap(data => this.translate.get('ROBOTS_AVAILABLE_STATE_STATISTICS', data));

        this.balance = this.publicService.getBalance();

        this.consumed = this.publicService.getConsumed();

        this.runningRobotCount = this.robotService.getRobotCountByStatus((robot: Robot) => robot.status === RobotStatus.RUNNING).pipe(map(robots => robots.length));

        this.robotTotal = this.robotService.getRobots().pipe(map(robots => robots.length));

        this.grossProfit = this.robotService.getGrossProfit();
    }

}
