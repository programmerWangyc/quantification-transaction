import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { RobotDetail } from '../../interfaces/response.interface';
import { RobotService } from './../providers/robot.service';

interface RobotStatusBtn {
    status: string;

}
@Component({
    selector: 'app-robot-overview',
    templateUrl: './robot-overview.component.html',
    styleUrls: ['./robot-overview.component.scss']
})
export class RobotOverviewComponent extends BusinessComponent {

    robot: Observable<RobotDetail>

    subscription$$: Subscription;

    statusBtnText: Observable<string>;

    restart$: Subject<RobotDetail> = new Subject();

    stop$: Subject<RobotDetail> = new Subject();

    watchDot$: Subject<RobotDetail> = new Subject();

    operateBtnText: Observable<string>;

    watchDogBtnText: Observable<string>;

    isLoading: Observable<boolean>;

    constructor(
        private robotService: RobotService,
    ) {
        super();
    }

    ngOnInit() {
        this.launch();

        this.initialModel();
    }

    launch() {
        this.subscription$$ = this.robotService.launchRestartRobot(this.restart$)
            .add(this.robotService.launchStopRobot(this.stop$))
            .add(this.robotService.handleRobotRestartError())
            .add(this.robotService.handleRobotStopError());
    }

    initialModel() {
        this.robot = this.robotService.getRobotDetail();

        this.isLoading = this.robotService.isLoading();

        this.operateBtnText = this.robotService.getOperateBtnText();
   }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.robotService.resetRobotDetail();
    }

}
