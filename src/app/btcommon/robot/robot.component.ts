import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { BusinessComponent } from '../../interfaces/business.interface';
import { Breadcrumb } from '../../interfaces/constant.interface';
import { Robot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { WatchDogService } from '../../shared/providers/watch-dog.service';
import { GetRobotListRequest } from './../../interfaces/request.interface';
import { RobotOperateService } from './../providers/robot.operate.service';
import { RobotService } from './../providers/robot.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-robot',
    templateUrl: './robot.component.html',
    styleUrls: ['./robot.component.scss']
})
export class RobotComponent extends BusinessComponent {
    subscription$$: Subscription;

    data: Observable<Robot[]>;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT' }];

    tableHead: string[] = ['NAME', 'STRATEGY', 'STATUS', 'PROFIT', 'PUBLISH', 'CREATE_DATE', 'OPERATE'];

    buttonType = 'primary';

    buttonSize = 'large';

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
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();

        this.robotList$.next({ start: -1, limit: -1, status: -1 });
    }

    initialModel() {
        this.data = this.robotService.getRobots().startWith([]);

        this.isLoading = this.robotOperate.getPublicRobotLoadingState();

        this.isSubAccount = this.pubService.isSubAccount();
    }

    launch() {
        this.subscription$$ = this.robotService.launchRobotList(this.robotList$)
            .add(this.robotOperate.launchPublicRobot(this.publicRobot$))
            .add(this.publicRobot$.subscribe(robot => this.currentPublicRobot = robot))
            .add(this.robotOperate.launchRestartRobot(this.restartRobot$, false))
            .add(this.robotOperate.launchStopRobot(this.stopRobot$))
            .add(this.robotOperate.launchDeleteRobot(this.deleteRobot$))
            .add(this.robotOperate.monitorDeleteRobotResult())
            .add(this.watchDogService.launchSetRobotWatchDog(this.setRobotWD$))
            .add(this.robotOperate.updateRobotWDState(this.watchDogService.getLatestRobotWatchDogState()))
            .add(this.robotOperate.handlePublicRobotError())
            .add(this.robotService.handleRobotListError())
            .add(this.robotOperate.handleRobotRestartError())
            .add(this.robotOperate.handleDeleteRobotError())
            .add(this.robotOperate.handleRobotStopError())
            .add(this.watchDogService.handleSetWatchDogError())
    }

    navigateTo(path: string): void {
        this.router.navigate([path], { relativeTo: this.activatedRoute });
    }

    ngOnDestroy() {
        this.robotOperate.resetRobotOperate();

        this.subscription$$.unsubscribe();
    }
}
