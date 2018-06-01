import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-robot',
    templateUrl: './robot.component.html',
    styleUrls: ['./robot.component.scss']
})
export class RobotComponent implements OnInit {

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT' }];

    buttonType = 'primary';

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit() {
    }

    navigateTo(path: string): void {
        this.router.navigate([path], { relativeTo: this.activatedRoute });
    }
}
