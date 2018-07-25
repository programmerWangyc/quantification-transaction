import { Component, OnInit } from '@angular/core';

import { Breadcrumb } from '../../interfaces/app.interface';

/**
 * @ignore
 */
@Component({
    selector: 'app-robot-creation',
    templateUrl: './robot-creation.component.html',
    styleUrls: ['./robot-creation.component.scss'],
})
export class RobotCreationComponent implements OnInit {

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'ROBOT', path: '../../' }, { name: 'CREATE_ROBOT' }];

    constructor() { }

    ngOnInit() {
    }

}
