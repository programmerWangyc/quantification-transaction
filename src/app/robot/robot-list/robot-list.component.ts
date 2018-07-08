import { Component } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';

import { BaseComponent } from '../../base/base.component';
import { Robot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { WatchDogService } from '../../shared/providers/watch-dog.service';
import { GetRobotListRequest } from './../../interfaces/request.interface';
import { RobotOperateService } from './../providers/robot.operate.service';
import { RobotService } from './../providers/robot.service';

@Component({
    selector: 'app-robot-list',
    templateUrl: './robot-list.component.html',
    styleUrls: ['./robot-list.component.scss']
})
export class RobotListComponent extends BaseComponent {
    subscription$$: Subscription;

    data: Observable<Robot[]>;

    tableHead: string[] = ['NAME', 'STRATEGY', 'STATUS', 'PROFIT', 'PUBLISH', 'CREATE_DATE', 'OPERATE'];

    publicRobot$: Subject<Robot> = new Subject();

    robotList$: Subject<GetRobotListRequest> = new Subject();

    isLoading: Observable<boolean>;

    currentPublicRobot: Robot;

    restartRobot$: Subject<Robot> = new Subject();

    stopRobot$: Subject<Robot> = new Subject();

    deleteRobot$: Subject<Robot> = new Subject();

    setRobotWD$: Subject<Robot> = new Subject();

    isSubAccount: Observable<boolean>;

    constructor(
        private robotService: RobotService,
        private robotOperate: RobotOperateService,
        private pubService: PublicService,
        private watchDogService: WatchDogService,
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();

        this.robotList$.next({ start: -1, limit: -1, status: -1 });
    }

    initialModel() {
        this.data = this.robotService.getRobots()
            .pipe(
                startWith([])
            );

        this.isLoading = this.robotOperate.getPublicRobotLoadingState();

        this.isSubAccount = this.pubService.isSubAccount();
    }

    launch() {
        this.subscription$$ = this.robotService.launchRobotList(this.robotList$)
            .add(this.robotOperate.handlePublicRobotError())
            .add(this.robotService.handleRobotListError())
            .add(this.robotOperate.handleRobotRestartError())
            .add(this.robotOperate.handleDeleteRobotError())
            .add(this.robotOperate.handleRobotStopError())
            .add(this.watchDogService.handleSetWatchDogError())
            .add(this.robotOperate.launchPublicRobot(this.publicRobot$))
            .add(this.publicRobot$.subscribe(robot => this.currentPublicRobot = robot))
            .add(this.robotOperate.launchRestartRobot(this.restartRobot$, false))
            .add(this.robotOperate.launchStopRobot(this.stopRobot$))
            .add(this.robotOperate.launchDeleteRobot(this.deleteRobot$))
            .add(this.robotOperate.monitorDeleteRobotResult())
            .add(this.watchDogService.launchSetRobotWatchDog(this.setRobotWD$))
            .add(this.robotOperate.updateRobotWDState(this.watchDogService.getLatestRobotWatchDogState()))
    }

    ngOnDestroy() {
        this.robotOperate.resetRobotOperate();

        this.subscription$$.unsubscribe();
    }
}
