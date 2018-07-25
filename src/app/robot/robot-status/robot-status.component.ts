import { Component, ElementRef, Renderer2 } from '@angular/core';

import { flatten, isString } from 'lodash';
import { merge, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BaseComponent, FoldableBusinessComponent } from '../../base/base.component';
import { RobotLogService } from '../providers/robot.log.service';
import { RobotService } from '../providers/robot.service';
import { RobotStatusTable } from '../robot.interface';

@Component({
    selector: 'app-robot-status',
    templateUrl: './robot-status.component.html',
    styleUrls: ['./robot-status.component.scss'],
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
        const source = this.robotService.getRobotSummary(this.robotLog.getRobotLogs()
            .pipe(
                map(logs => logs.summary)
            )
        );

        this.tabs = source
            .pipe(
                map(res => flatten(res).filter(item => item && !!item.type && item.type === 'table'))
            );

        this.labels = source
            .pipe(
                map(res => flatten(res).filter(item => isString(item)))
            );

        this.hasTabs = this.tabs.pipe(map(tabs => !!tabs.length));

        this.hasStatusInfo = merge(
            this.hasTabs,
            this.labels
                .pipe(
                    map(labels => !!labels.length),
                    startWith(false)
                )
        );
    }

    launch() {
        // this.subscription$$ = this.robotService.getRobotSummary(this.robotLog.getRobotLogs().map(logs => logs.summary))
        //     .map(res => flatten(res).filter(item => item && !!item.type && item.type === 'table'))
        //     .subscribe(v => console.log(v));
    }

    ngOnDestroy() {

    }
}
