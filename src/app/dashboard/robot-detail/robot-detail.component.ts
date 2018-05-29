import 'rxjs/add/operator/mergeMapTo';

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/constant.interface';
import { RobotService } from '../../robot/providers/robot.service';
import { BtNodeService } from './../../providers/bt-node.service';
import { PlatformService } from './../../providers/platform.service';
import { PublicService } from './../../providers/public.service';

@Component({
    selector: 'app-robot-detail',
    templateUrl: './robot-detail.component.html',
    styleUrls: ['./robot-detail.component.scss']
})
export class RobotDetailComponent extends BaseComponent {

    paths: Breadcrumb[]

    subscription$$: Subscription;

    isLoading: Observable<boolean>;

    constructor(
        private robotService: RobotService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private publicService: PublicService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
    ) { super() }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        const name = this.activatedRoute.snapshot.paramMap.get('name');

        this.paths = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT', path: '../../' }, { name }];

        this.isLoading = this.robotService.isLoading();
    }

    launch() {
        const id = this.activatedRoute.paramMap.map(param => +param.get('id'));

        const isMainAccount = this.publicService.isSubAccount().filter(sure => !sure);

        this.subscription$$ = this.robotService.launchRobotDetail(id.map(id => ({ id })))
            .add(this.robotService.monitorServerSendRobotStatus())
            .add(this.robotService.launchSubscribeRobot(id.map(id => ({ id })), false))
            .add(this.btNodeService.launchGetNodeList(isMainAccount.mergeMapTo(id.mapTo(true))))
            .add(this.platformService.launchGetPlatformList(isMainAccount.mergeMapTo(id.mapTo(true))))
            .add(this.robotService.handleRobotDetailError())
            .add(this.robotService.handleSubscribeRobotError())
            .add(this.btNodeService.handleNodeListError())
            .add(this.platformService.handlePlatformListError())
    }

    ngOnDestroy() {
        this.robotService.launchSubscribeRobot(Observable.of({ id: 0 }));

        this.subscription$$.unsubscribe();

    }
}
