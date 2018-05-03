import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { VariableOverview } from './../../interfaces/constant.interface';

@Component({
    selector: 'app-robot-arg',
    templateUrl: './robot-arg.component.html',
    styleUrls: ['./robot-arg.component.scss'],
})
export class RobotArgComponent implements OnInit {
    @Input() isAlternative = false;

    @Input() title: string;

    @Input() args: VariableOverview[];

    @Output() change: EventEmitter<VariableOverview> = new EventEmitter();

    @Output() command: EventEmitter<VariableOverview> = new EventEmitter();

    constructor() { }

    ngOnInit() {

    }

}
