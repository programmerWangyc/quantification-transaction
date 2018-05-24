import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';

import { FoldableBusinessComponent } from '../../interfaces/business.interface';
import { RobotLogService } from './../providers/robot.log.service';
import { RobotService } from './../providers/robot.service';
import { flatten, isString } from 'lodash';
import { RobotStatusTable } from '../../interfaces/constant.interface';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-robot-status',
    templateUrl: './robot-status.component.html',
    styleUrls: ['./robot-status.component.scss']
})
export class RobotStatusComponent extends FoldableBusinessComponent {
    isFold = false;

    subscription$$: Subscription;

    tabs: Observable<RobotStatusTable[]>;

    hasTabs: Observable<boolean>;

    labels: Observable<string[]>;

    hasStatusInfo: Observable<boolean>;

    constructor(
        private robotService: RobotService,
        private robotLog: RobotLogService,
        public eleRef: ElementRef,
        public render: Renderer2,
    ) {
        super(render, eleRef);
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        const source = this.robotService.getRobotSummary(this.robotLog.getRobotLogs().map(logs => logs.summary));

        this.tabs = source
            .map(res => flatten(res).filter(item => item && !!item.type && item.type === 'table'))

        this.labels = source
            .map(res => flatten(res).filter(item => isString(item)));

        this.hasTabs = this.tabs.map(tabs => !!tabs.length);

        this.hasStatusInfo = this.hasTabs.merge(this.labels.map(labels => !!labels.length)).startWith(false);
    }

    launch() {
        // this.subscription$$ = this.robotService.getRobotSummary(this.robotLog.getRobotLogs().map(logs => logs.summary))
        //     .map(res => flatten(res).filter(item => item && !!item.type && item.type === 'table'))
        //     .subscribe(v => console.log(v));
    }

    ngOnDestroy() {

    }
}
