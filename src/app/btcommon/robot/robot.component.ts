import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { BusinessComponent } from '../../interfaces/business.interface';
import { Robot } from '../../interfaces/response.interface';
import { GetRobotListRequest } from './../../interfaces/request.interface';
import { RobotService } from './../providers/robot.service';

@Component({
    selector: 'app-robot',
    templateUrl: './robot.component.html',
    styleUrls: ['./robot.component.scss']
})
export class RobotComponent extends BusinessComponent {
    subscription$$: Subscription;

    data: Observable<Robot[]>;

    paths = ['CONTROL_CENTER', 'ROBOT'];

    publicRobot$: Subject<Robot> = new Subject();

    robotList$: Subject<GetRobotListRequest> = new Subject();

    constructor(
        private robotService: RobotService,
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
    }

    launch() {
        this.subscription$$ = this.robotService.launchRobotList(this.robotList$)
            .add(this.robotService.launchPublicRobot(this.publicRobot$))
            .add(this.robotService.handlePublicRobotError())
            .add(this.robotService.handleRobotListError())
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}