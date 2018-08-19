import { Component } from '@angular/core';

import { Observable, of, Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';

import { BaseComponent } from '../../base/base.component';
import { Robot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { WatchDogService } from '../../shared/providers/watch-dog.service';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';

@Component({
    selector: 'app-robot-list',
    templateUrl: './robot-list.component.html',
    styleUrls: ['./robot-list.component.scss'],
})
export class RobotListComponent extends BaseComponent {

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * Source data
     */
    data: Observable<Robot[]>;

    /**
     * 公开机器人
     */
    publicRobot$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * 当前公开的机器人
     */
    currentPublicRobot: Robot;

    /**
     * @ignore
     */
    restartRobot$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    stopRobot$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    deleteRobot$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    setRobotWD$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    isSubAccount: Observable<boolean>;

    constructor(
        private robotService: RobotService,
        private robotOperate: RobotOperateService,
        private pubService: PublicService,
        private watchDogService: WatchDogService,
    ) {
        super();
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
        this.data = this.robotService.getRobots().pipe(
            startWith([])
        );

        this.isLoading = this.robotOperate.getPublicRobotLoadingState();

        this.isSubAccount = this.pubService.isSubAccount();
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.robotOperate.handlePublicRobotError()
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
            .add(this.watchDogService.launchSetWatchDog(this.setRobotWD$))
            .add(this.robotOperate.updateRobotWDState(this.watchDogService.getLatestWatchDogState()))
            .add(this.robotService.launchRobotList(of({ start: -1, limit: -1, status: -1 })));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.robotOperate.resetRobotOperate();

        this.subscription$$.unsubscribe();
    }
}
