import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Observable ,  Subject ,  Subscription } from 'rxjs';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { RobotDetail } from '../../interfaces/response.interface';
import { WatchDogService } from './../../shared/providers/watch-dog.service';
import { RobotOperateService } from './../providers/robot.operate.service';
import { RobotService } from './../providers/robot.service';

interface RobotStatusBtn {
    status: string;

}
@Component({
    selector: 'app-robot-overview',
    templateUrl: './robot-overview.component.html',
    styleUrls: ['./robot-overview.component.scss'],
    // animations: [
    //     trigger('foldState', [
    //         state('fold', style({ display: 'none' })),
    //         state('unfold', style({ display: 'block' }))
    //     ]),
    //     transition('unfold => fold', [style({ height: '*' }), animate(250, style({ height: 0 }))]),
    //     transition('fold => unfold', animate(250, style({ height: '*' }))),
    // ]
})
export class RobotOverviewComponent extends FoldableBusinessComponent implements BaseComponent {

    robot: Observable<RobotDetail>

    subscription$$: Subscription;

    statusBtnText: Observable<string>;

    restart$: Subject<RobotDetail> = new Subject();

    stop$: Subject<RobotDetail> = new Subject();

    watchDog$: Subject<RobotDetail> = new Subject();

    operateBtnText: Observable<string>;

    watchDogBtnText: Observable<string>;

    isStopLoading: Observable<boolean>;

    isRestartLoading: Observable<boolean>;

    statusTip: Observable<string>;

    isFold = false;

    buttonSize = 'small';

    constructor(
        private robotService: RobotService,
        private robotOperate: RobotOperateService,
        public eleRef: ElementRef,
        public render: Renderer2,
        private watchDogService: WatchDogService,
    ) {
        super(render, eleRef);
    }

    ngOnInit() {
        this.launch();

        this.initialModel();
    }

    launch() {
        this.subscription$$ = this.robotOperate.launchRestartRobot(this.restart$)
            .add(this.robotOperate.launchStopRobot(this.stop$))
            .add(this.watchDogService.launchSetRobotWatchDog(this.watchDog$))
            .add(this.robotOperate.handleRobotRestartError())
            .add(this.robotOperate.handleRobotStopError())
            .add(this.watchDogService.handleSetWatchDogError());
    }

    initialModel() {
        this.robot = this.robotService.getRobotDetail();

        this.isStopLoading = this.robotOperate.isLoading('stop');

        this.isRestartLoading = this.robotOperate.isLoading('restart');

        this.operateBtnText = this.robotOperate.getOperateBtnText();

        this.watchDogBtnText = this.robotOperate.getRobotWatchDogBtnText();

        this.statusTip = this.robotOperate.getRobotStatusTip();
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.robotService.resetRobotDetail();
    }
}
