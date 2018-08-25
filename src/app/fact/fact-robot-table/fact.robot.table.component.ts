import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs/operators';

import { PublicRobot } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';

@Component({
    selector: 'app-fact-robot-table',
    templateUrl: './fact.robot.table.component.html',
    styleUrls: ['./fact.robot.table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactRobotTableComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() robots: PublicRobot[];

    constructor(
        private publicService: PublicService,
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
    lookupStrategy(robot: PublicRobot): void {
        this.publicService.isLogin().pipe(
            take(1)
        ).subscribe(isLogged => {
            if (isLogged) {
                this.router.navigate([robot.id, robot.name], { relativeTo: this.activatedRoute });
            } else {
                this.router.navigate(['auth', 'login'], { relativeTo: this.activatedRoute.root });
            }
        });
    }
}
