import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { BusinessComponent } from '../../interfaces/business.interface';
import { Breadcrumb } from '../../interfaces/constant.interface';
import { Robot } from '../../interfaces/response.interface';
import { GetRobotListRequest } from './../../interfaces/request.interface';
import { RobotOperateService } from './../providers/robot.operate.service';
import { RobotService } from './../providers/robot.service';

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

    constructor(
        private robotService: RobotService,
        private robotOperate: RobotOperateService,
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
    }

    launch() {
        this.subscription$$ = this.robotService.launchRobotList(this.robotList$)
            .add(this.robotOperate.launchPublicRobot(this.publicRobot$))
            .add(this.publicRobot$.subscribe(robot => this.currentPublicRobot = robot))
            .add(this.robotOperate.handlePublicRobotError())
            .add(this.robotService.handleRobotListError());
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
