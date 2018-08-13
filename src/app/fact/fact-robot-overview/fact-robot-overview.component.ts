import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

import { FoldableBusinessComponent } from '../../base/base.component';
import { RobotDetail } from '../../interfaces/response.interface';
import { RobotService } from '../../robot/providers/robot.service';

@Component({
    selector: 'app-fact-robot-overview',
    templateUrl: './fact-robot-overview.component.html',
    styleUrls: ['./fact-robot-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactRobotOverviewComponent extends FoldableBusinessComponent implements OnInit {

    /**
     * Robot detail
     */
    @Input() robot: RobotDetail;

    /**
     * @ignore
     */
    isFold = false;

    /**
     * @ignore
     */
    buttonSize = 'small';

    constructor(
        private robotService: RobotService,
        public eleRef: ElementRef,
        public render: Renderer2,
    ) {
        super(render, eleRef);
    }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.robotService.resetRobotDetail();

        this.robotService.resetRobotState();
    }
}
