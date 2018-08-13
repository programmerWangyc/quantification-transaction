import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PublicRobot } from '../../interfaces/response.interface';

@Component({
    selector: 'app-robot',
    templateUrl: './robot.component.html',
    styleUrls: ['./robot.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RobotComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() robots: PublicRobot[];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
    navigateTo(robot: PublicRobot): void {
        this.router.navigate(['./', robot.id, robot.name], { relativeTo: this.activatedRoute });
    }
}
