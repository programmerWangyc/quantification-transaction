import { Component, ElementRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent } from '../../interfaces/business.interface';
import { RobotDetail } from '../../interfaces/response.interface';
import { WatchDogService } from './../../shared/providers/watch-dog.service';
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
export class RobotOverviewComponent extends BusinessComponent {

    robot: Observable<RobotDetail>

    subscription$$: Subscription;

    statusBtnText: Observable<string>;

    restart$: Subject<RobotDetail> = new Subject();

    stop$: Subject<RobotDetail> = new Subject();

    watchDot$: Subject<RobotDetail> = new Subject();

    operateBtnText: Observable<string>;

    watchDogBtnText: Observable<string>;

    isLoading: Observable<boolean>;

    statusTip: Observable<string>;

    isFold = false;

    @ViewChild('body') body: TemplateRef<any>;

    constructor(
        private robotService: RobotService,
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
        this.subscription$$ = this.robotService.launchRestartRobot(this.restart$)
            .add(this.robotService.launchStopRobot(this.stop$))
            .add(this.watchDogService.launchSetRobotWatchDog(this.watchDot$))
            .add(this.robotService.handleRobotRestartError())
            .add(this.robotService.handleRobotStopError())
            .add(this.watchDogService.handleSetWatchDogError());
    }

    initialModel() {
        this.robot = this.robotService.getRobotDetail();

        this.isLoading = this.robotService.isLoading();

        this.operateBtnText = this.robotService.getOperateBtnText();

        this.statusTip = this.robotService.getRobotStatusTip();
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.robotService.resetRobotDetail();
    }

    toggleFold() {
        this.isFold = !this.isFold;

        this.toggle(this.isFold);
    }

}
