import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Observable } from 'rxjs';

import { VariableOverview } from '../../interfaces/app.interface';
import { GroupedList, UtilService } from '../../providers/util.service';
import { RobotConstantService } from '../providers/robot.constant.service';

@Component({
    selector: 'app-strategy-arg',
    templateUrl: './strategy-arg.component.html',
    styleUrls: ['./strategy-arg.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrategyArgComponent implements OnInit {
    @Input() isAlternative = false;

    @Input() title: string;

    @Input() set args(input: VariableOverview[]) {
        if (!input) return;

        this._args = input;

        this.groupedArgs = this.utilService.getGroupedStrategyArgs(input, this.constant.getArgumentGroupName(this.constant.ARG_GROUP_FLAG_REG));
    }

    private _args = [];

    get args(): VariableOverview[] {
        return this._args;
    }

    @Output() change: EventEmitter<VariableOverview> = new EventEmitter();

    @Output() command: EventEmitter<VariableOverview> = new EventEmitter();

    @Input() titleClass = 'title';

    groupedArgs: Observable<GroupedList<VariableOverview>[]>;

    constructor(
        private constant: RobotConstantService,
        private utilService: UtilService,
    ) { }

    ngOnInit() {

    }

    isButton(value: any): boolean {
        return this.constant.isButton(value);
    }

}
