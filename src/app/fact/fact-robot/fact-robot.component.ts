import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, mergeMapTo, take, takeWhile } from 'rxjs/operators';

import { CommentService } from '../../comment/providers/comment.service';
import { Breadcrumb } from '../../interfaces/app.interface';
import { RobotDetail } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PlatformService } from '../../providers/platform.service';
import { PublicService } from '../../providers/public.service';
import { RobotService } from '../../robot/providers/robot.service';
import { CommentBaseComponent } from '../../square/square/square.component';
import { BtCommentType } from '../../app.config';

@Component({
    selector: 'app-fact-robot',
    templateUrl: './fact-robot.component.html',
    styleUrls: ['./fact-robot.component.scss'],
})
export class FactRobotComponent extends CommentBaseComponent implements OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[];

    /**
     * @ignore
     */
    robot: Observable<RobotDetail>;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private robotService: RobotService,
        private activatedRoute: ActivatedRoute,
        public publicService: PublicService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
        public commentService: CommentService,
        public translate: TranslateService,
    ) {
        super(publicService, commentService, translate);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        const id = this.activatedRoute.snapshot.paramMap.get('id');

        this.initialModel();

        this.launch(BtCommentType.robot + id, () => this.isAlive);

        this.privateInitialModel();

        this.privateLaunch();
    }

    /**
     * @ignore
     */
    private privateInitialModel() {
        const name = this.activatedRoute.snapshot.paramMap.get('name');

        this.paths = [{ name: 'FACT_FINDER', path: '../../' }, { name }];

        this.isLoading = this.robotService.isLoading();

        this.robot = this.robotService.getRobotDetail();
    }

    /**
     * @ignore
     */
    private privateLaunch() {
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

        const keepAlive = () => this.isAlive;

        this.robotService.launchRobotDetail(requestById);

        this.btNodeService.launchGetNodeList(isMain.pipe(
            takeWhile(keepAlive)
        ));

        this.platformService.launchGetPlatformList(isMain.pipe(
            takeWhile(keepAlive)
        ));

        this.robotService.handleRobotDetailError(keepAlive);

        this.btNodeService.handleNodeListError(keepAlive);

        this.platformService.handlePlatformListError(keepAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
