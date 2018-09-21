import { Component } from '@angular/core';

import { Observable, of, Subject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { TableStatistics } from '../../interfaces/app.interface';
import { Robot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { WatchDogService } from '../../shared/providers/watch-dog.service';
import { RobotOperateType } from '../../store/robot/robot.reducer';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';

@Component({
    selector: 'app-robot-list',
    templateUrl: './robot-list.component.html',
    styleUrls: ['./robot-list.component.scss'],
})
export class RobotListComponent extends BaseComponent {

    subscription$$: Subscription;

    data: Observable<Robot[]>;

    publicRobot$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    isPublicLoading: Observable<boolean>;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    currentPublicRobot: Robot;

    restartRobot$: Subject<Robot> = new Subject();

    stopRobot$: Subject<Robot> = new Subject();

    deleteRobot$: Subject<Robot> = new Subject();

    setRobotWD$: Subject<Robot> = new Subject();

    /**
     * @ignore
     */
    isSubAccount: Observable<boolean>;

    /**
     * 数量统计
     */
    statisticsParams: Observable<TableStatistics>;

    /**
     * @ignore
     */
    pageSize = 20;

    /**
     * @ignore
     */
    isAlive = true;

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

        this.isPublicLoading = this.robotOperate.isLoading(RobotOperateType.public);

        this.isLoading = this.robotService.isLoading();

        this.isSubAccount = this.pubService.isSubAccount();

        this.statisticsParams = this.data.pipe(
            map(data => this.robotService.getTableStatistics(data.length, this.pageSize))
        );
    }

    /**
     * @ignore
     */
    launch() {
        const keepAlive = () => this.isAlive;

        this.robotOperate.handlePublicRobotError(keepAlive);

        this.robotService.handleRobotListError(keepAlive);

        this.robotOperate.handleRobotRestartError(keepAlive);

        this.robotOperate.handleDeleteRobotError(keepAlive);

        this.robotOperate.handleRobotStopError(keepAlive);

        this.watchDogService.handleSetWatchDogError(keepAlive);

        const publicRobotObs = this.publicRobot$.asObservable().pipe(
            takeWhile(keepAlive)
        );


        publicRobotObs.subscribe(robot => this.currentPublicRobot = robot);

        this.subscription$$ = this.robotOperate.launchPublicRobot(publicRobotObs)
            .add(this.robotOperate.launchRestartRobot(this.restartRobot$.asObservable(), false))
            .add(this.robotOperate.launchStopRobot(this.stopRobot$.asObservable()))
            .add(this.robotOperate.launchDeleteRobot(this.deleteRobot$.asObservable()))
            .add(this.watchDogService.launchSetWatchDog(this.setRobotWD$.asObservable()));

        this.robotOperate.updateRobotWDState(this.watchDogService.getLatestWatchDogState(keepAlive));

        this.robotService.launchRobotList(of({ start: -1, limit: -1, status: -1 }));

        this.robotOperate.monitorDeleteRobotResult(keepAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.robotOperate.resetRobotOperate();

        this.subscription$$.unsubscribe();
    }
}
