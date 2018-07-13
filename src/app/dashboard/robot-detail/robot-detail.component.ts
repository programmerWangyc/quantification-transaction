import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, mergeMapTo } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PlatformService } from '../../providers/platform.service';
import { PublicService } from '../../providers/public.service';
import { RobotService } from '../../robot/providers/robot.service';



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
        const id = this.activatedRoute.paramMap.pipe(
            map(param => +param.get('id'))
        );

        const isMainAccount = this.publicService.isSubAccount().pipe(
            filter(sure => !sure),
            distinctUntilChanged(),
        );

        const requestById = id.pipe(map(id => ({ id })));

        const isMain = isMainAccount.pipe(
            mergeMapTo(id.pipe(
                mapTo(true)
            ))
        );

        this.subscription$$ = this.robotService.launchRobotDetail(requestById)
            .add(this.robotService.monitorServerSendRobotStatus())
            .add(this.robotService.launchSubscribeRobot(requestById, false))
            .add(this.btNodeService.launchGetNodeList(isMain))
            .add(this.platformService.launchGetPlatformList(isMain))
            .add(this.robotService.handleRobotDetailError())
            .add(this.robotService.handleSubscribeRobotError())
            .add(this.btNodeService.handleNodeListError())
            .add(this.platformService.handlePlatformListError())
    }

    ngOnDestroy() {
        this.robotService.launchSubscribeRobot(of({ id: 0 }));

        this.subscription$$.unsubscribe();

    }
}
