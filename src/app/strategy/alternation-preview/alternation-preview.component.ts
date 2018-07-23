import { Component, Input, OnInit } from '@angular/core';

import { VariableType } from '../../app.config';
import { TipService } from '../../providers/tip.service';
import { StrategyMetaArg } from '../add-arg/add-arg.component';
import { StrategyConstantService } from '../providers/strategy.constant.service';

interface StrategyMetaArgPreview extends StrategyMetaArg {
    selected?: number;
}

@Component({
    selector: 'app-alternation-preview',
    templateUrl: './alternation-preview.component.html',
    styleUrls: ['./alternation-preview.component.scss']
})
export class AlternationPreviewComponent implements OnInit {

    /**
     * 交互参数或参数集合
     */
    @Input() set param(value: StrategyMetaArg | StrategyMetaArg[]) {
        if (!value) return;

        if (Array.isArray(value)) {
            this.data = value.map(item => this.patchValue(item));
        } else {
            this.data = [...this.data, this.patchValue(value)];
        }
    }

    /**
     * 已经从参数表中删除了的参数
     */
    @Input() set removedArg(removed: StrategyMetaArg) {
        if (!removed) return;

        this._removed = removed;

        this.data = this.data.filter(item => item.name !== removed.name);
    }

    /**
     * @ignore
     */
    private _removed: StrategyMetaArg;

    /**
     * @ignore
     */
    data: StrategyMetaArg[] = [];

    constructor(
        private tip: TipService,
        private constant: StrategyConstantService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * 预览交互动作；
     */
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

    /**
     * 参数显示前的优化；
     */
    patchValue(value: StrategyMetaArg): StrategyMetaArgPreview {
        if (value.type === VariableType.SELECT_TYPE) {
            return { ...value, selected: 0 };
        } else if (value.type === VariableType.ENCRYPT_STRING_TYPE) {
            return { ...value, defaultValue: this.constant.withoutPrefix(value.defaultValue, this.constant.ENCRYPT_PREFIX) };
        } else {
            return value;
        }
    }
}
