import 'rxjs/add/operator/mergeMapTo';

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { RobotService } from '../../btcommon/providers/robot.service';
import { BusinessComponent } from '../../interfaces/business.interface';
import { BtNodeService } from './../../providers/bt-node.service';
import { PlatformService } from './../../providers/platform.service';
import { PublicService } from './../../providers/public.service';

@Component({
    selector: 'app-robot-detail',
    templateUrl: './robot-detail.component.html',
    styleUrls: ['./robot-detail.component.scss']
})
export class RobotDetailComponent extends BusinessComponent {

    paths: string[]

    subscription$$: Subscription;

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

        this.paths = ['CONTROL_CENTER', 'ROBOT', name];
    }

    launch() {
        const id = this.activatedRoute.paramMap.map(param => ({ id: +param.get('id') }));

        const logsParam = this.activatedRoute.paramMap.map(param => {
            const result = {
                robotId: +param.get('id'),
                // table Log
                logMinId: 0,
                logMaxId: 0,
                logOffset: 0,
                logLimit: 20,
                // table Profit
                profitMinId: 0,
                profitMaxId: 0,
                profitOffset: 0,
                profitLimit: 1000,
                // table Chart
                chartMinId: 0,
                chartMaxId: 0,
                chartOffset: 0,
                chartLimit: 1000,
                chartUpdateBaseId: 0,
                chartUpdateTime: 0,
            };
            return result;
        })

        const isMainAccount = this.publicService.isSubAccount().filter(sure => !sure);

        this.subscription$$ = this.robotService.launchRobotDetail(id)
            .add(this.robotService.launchSubscribeRobot(id))
            .add(this.robotService.launchRobotLogs(logsParam))
            .add(this.btNodeService.launchGetNodeList(isMainAccount.mergeMapTo(id.mapTo(true))))
            .add(this.platformService.launchGetPlatformList(isMainAccount.mergeMapTo(id.mapTo(true))))
            .add(this.robotService.handleRobotDetailError())
            .add(this.robotService.handleSubscribeRobotError())
            .add(this.robotService.handleRobotLogsError())
            .add(this.btNodeService.handleNodeListError())
            .add(this.platformService.handlePlatformListError())
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
