import { Component, OnInit, Input } from '@angular/core';
import { StrategyMetaArg } from '../add-arg/add-arg.component';
import { NzMessageService } from 'ng-zorro-antd';
import { TipService } from '../../providers/tip.service';
import { VariableType } from '../../app.config';

interface StrategyMetaArgPreview extends StrategyMetaArg {
    selected?: number;
}

@Component({
    selector: 'app-alternation-preview',
    templateUrl: './alternation-preview.component.html',
    styleUrls: ['./alternation-preview.component.scss']
})
export class AlternationPreviewComponent implements OnInit {

    @Input() set param(value: StrategyMetaArg | StrategyMetaArg[]) {
        if (!value) return;

        if (Array.isArray(value)) {
            this.data = value.map(item => this.patchValue(item));
        } else {
            this.data = [...this.data, this.patchValue(value)];
        }
    }

    @Input() set removedArg(removed: StrategyMetaArg) {
        if (!removed) return;

        this._removed = removed;

        this.data = this.data.filter(item => item.name !== removed.name);
    }

    private _removed: StrategyMetaArg;

    data: StrategyMetaArg[] = [];

    constructor(
        private tip: TipService,
    ) { }

    ngOnInit() {
    }

    preview(target: StrategyMetaArgPreview): void {
        let command = '';

        if (target.type === VariableType.BUTTON_TYPE) {
            command = target.name;
        } else if (target.type === VariableType.SELECT_TYPE) {
            command = target.name + ':' + target.selected;
        } else {
            command = target.name + ':' + target.defaultValue;
        }

        this.tip.messageInfo('SEND_COMMAND_TO_ROBOT', { command });
    }

    patchValue(value: StrategyMetaArg): StrategyMetaArgPreview {
        if (value.type === VariableType.SELECT_TYPE) {
            return { ...value, selected: 0 };
        } else {
            return value;
        }
    }
}
