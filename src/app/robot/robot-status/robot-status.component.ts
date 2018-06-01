import { Component, ElementRef, Renderer2 } from '@angular/core';
import { flatten, isString } from 'lodash';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { RobotStatusTable } from '../robot.interface';
import { RobotLogService } from './../providers/robot.log.service';
import { RobotService } from './../providers/robot.service';

@Component({
    selector: 'app-robot-status',
    templateUrl: './robot-status.component.html',
    styleUrls: ['./robot-status.component.scss']
})
export class RobotStatusComponent extends FoldableBusinessComponent implements BaseComponent {
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
