import { Component, OnInit, ViewChild } from '@angular/core';

import { Breadcrumb, DeactivateGuard } from '../../interfaces/app.interface';
import { CanDeactivateComponent } from '../../base/guard.service';
import { of } from 'rxjs';
import { CreateRobotComponent } from '../create-robot/create-robot.component';

/**
 * @ignore
 */
@Component({
    selector: 'app-robot-creation',
    templateUrl: './robot-creation.component.html',
    styleUrls: ['./robot-creation.component.scss'],
})
export class RobotCreationComponent implements OnInit, CanDeactivateComponent {

    paths: Breadcrumb[] = [{ name: 'ROBOT', path: '../' }, { name: 'CREATE_ROBOT' }];

    /**
     * @ignore
     */
    @ViewChild(CreateRobotComponent) formComponent: CreateRobotComponent;

    constructor() { }

    ngOnInit() {
    }

    canDeactivate(): DeactivateGuard[] {
        const touchedGuard: DeactivateGuard = {
            message: 'CONFIRM_LEAVE_ROBOT_CREATION',
            canDeactivate: of(this.formComponent.form.untouched),
        };

        return [touchedGuard];
    }

}
