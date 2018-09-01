import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, mergeMapTo, take, takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PlatformService } from '../../providers/platform.service';
import { PublicService } from '../../providers/public.service';
import { RobotService } from '../../robot/providers/robot.service';

@Component({
    selector: 'app-robot-detail',
    templateUrl: './robot-detail.component.html',
    styleUrls: ['./robot-detail.component.scss'],
})
export class RobotDetailComponent extends BaseComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[];

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    constructor(
        private robotService: RobotService,
        private activatedRoute: ActivatedRoute,
        private publicService: PublicService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
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
        const name = this.activatedRoute.snapshot.paramMap.get('name');

        this.paths = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT', path: '../../' }, { name }];

        /**
         * state: false ---> true ---> false;
         */
        this.isLoading = this.robotService.isLoading().pipe(
            take(3)
        );
    }

    /**
     * @ignore
     */
    launch() {
        const idObs = this.activatedRoute.paramMap.pipe(
            map(param => +param.get('id')),
            take(1)
        );

        const isMainAccount = this.publicService.isSubAccount().pipe(
            filter(sure => !sure),
            distinctUntilChanged(),
        );

        const requestById = idObs.pipe(
            map(id => ({ id }))
        );

        const isMain = isMainAccount.pipe(
            mergeMapTo(idObs.pipe(
                mapTo(true)
            ))
        );

        this.robotService.launchRobotDetail(requestById);

        this.robotService.launchSubscribeRobot(requestById);

        const keepAlive = () => this.isAlive;

        this.robotService.monitorServerSendRobotStatus(keepAlive);

        this.btNodeService.launchGetNodeList(isMain.pipe(
            takeWhile(keepAlive)
        ));

        this.platformService.launchGetPlatformList(isMain.pipe(
            takeWhile(keepAlive)
        ));

        this.robotService.handleRobotDetailError(keepAlive);

        this.robotService.handleSubscribeRobotError(keepAlive);

        this.btNodeService.handleNodeListError(keepAlive);

        this.platformService.handlePlatformListError(keepAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.robotService.launchSubscribeRobot(of({ id: 0 }));
    }
}
