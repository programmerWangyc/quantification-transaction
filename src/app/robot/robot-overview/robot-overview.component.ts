import { Component, ElementRef, Renderer2 } from '@angular/core';

import { Observable, Subject, Subscription } from 'rxjs';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { RobotDetail } from '../../interfaces/response.interface';
import { WatchDogService } from '../../shared/providers/watch-dog.service';
import { RobotOperateType } from '../../store/robot/robot.reducer';
import { RobotOperateService } from '../providers/robot.operate.service';
import { RobotService } from '../providers/robot.service';

@Component({
    selector: 'app-robot-overview',
    templateUrl: './robot-overview.component.html',
    styleUrls: ['./robot-overview.component.scss'],
})
export class RobotOverviewComponent extends FoldableBusinessComponent implements BaseComponent {

    /**
     * @ignore
     */
    robotDetail: Observable<RobotDetail>;

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * Restart robot flow;
     */
    restart$: Subject<RobotDetail> = new Subject();

    /**
     * Stop robot flow;
     */
    stop$: Subject<RobotDetail> = new Subject();

    /**
     * Watch dog toggle flow;
     */
    watchDog$: Subject<RobotDetail> = new Subject();

    /**
     * Operate button text. Difference during each processing;
     */
    operateBtnText: Observable<string>;

    /**
     * Watch dog button text;
     */
    watchDogBtnText: Observable<string>;

    /**
     * Stopping state;
     */
    isStopLoading: Observable<boolean>;

    /**
     * Restarting state;
     */
    isRestartLoading: Observable<boolean>;

    /**
     * @ignore
     */
    statusTip: Observable<string>;

    /**
     * @ignore
     */
    isFold = false;

    /**
     * @ignore
     */
    buttonSize = 'small';

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private robotService: RobotService,
        private robotOperate: RobotOperateService,
        public eleRef: ElementRef,
        public render: Renderer2,
        private watchDogService: WatchDogService,
    ) {
        super(render, eleRef);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.launch();

        this.initialModel();
    }

    /**
     * @ignore
     */
    launch() {
        const keepAlive = () => this.isAlive;

        this.subscription$$ = this.robotOperate.launchRestartRobot(this.restart$.asObservable())
            .add(this.robotOperate.launchStopRobot(this.stop$.asObservable()))
            .add(this.watchDogService.launchSetWatchDog(this.watchDog$.asObservable()));

        this.robotOperate.handleRobotStopError(keepAlive);

        this.robotOperate.handleRobotRestartError(keepAlive);

        this.watchDogService.handleSetWatchDogError(keepAlive);
    }

    /**
     * @ignore
     */
    initialModel() {
        this.robotDetail = this.robotService.getRobotDetail();

        this.isStopLoading = this.robotOperate.isLoading(RobotOperateType.stop);

        this.isRestartLoading = this.robotOperate.isLoading(RobotOperateType.restart);

        this.operateBtnText = this.robotOperate.getOperateBtnText();

        this.watchDogBtnText = this.robotOperate.getRobotWatchDogBtnText();

        this.statusTip = this.robotOperate.getRobotStatusTip();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();

        this.robotService.resetRobotDetail();

        this.robotService.resetRobotState();
    }
}
