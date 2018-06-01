import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { VariableOverview } from './../../interfaces/app.interface';

@Component({
    selector: 'app-strategy-arg',
    templateUrl: './strategy-arg.component.html',
    styleUrls: ['./strategy-arg.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrategyArgComponent implements OnInit {
    @Input() isAlternative = false;

    @Input() title: string;

    @Input() args: VariableOverview[];

    @Output() change: EventEmitter<VariableOverview> = new EventEmitter();

    @Output() command: EventEmitter<VariableOverview> = new EventEmitter();

    @Input() titleClass = 'title';

    constructor() { }

    ngOnInit() {

    }

}
