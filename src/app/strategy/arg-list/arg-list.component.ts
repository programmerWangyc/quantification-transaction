import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { omit } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';

import { VariableType } from '../../app.config';
import { VariableTypeDes } from '../../interfaces/app.interface';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { selectTypeValueFormat } from '../../validators/validators';
import { StrategyMetaArg } from '../add-arg/add-arg.component';
import { StrategyConstantService } from '../providers/strategy.constant.service';

export interface EditableStrategyMetaArg extends StrategyMetaArg {
    editing?: boolean;
    flag?: number;
}

export interface EditingArg {
    index: number;
    originValue: EditableStrategyMetaArg;
}

@Component({
    selector: 'app-arg-list',
    templateUrl: './arg-list.component.html',
    styleUrls: ['./arg-list.component.scss']
})
export class ArgListComponent implements OnInit {

    @Input() isAlternation = false;

    @Input() set param(value: StrategyMetaArg | StrategyMetaArg[]) {
        if (!value) return;

        if (Array.isArray(value)) {
            this.data = value.map(item => this.optimizeArg(item));
        } else {
            this.addArg(this.optimizeArg(value));
        }
    }

    @Output() removeArg: EventEmitter<StrategyMetaArg> = new EventEmitter();

    data: EditableStrategyMetaArg[] = [];

    editingArgs: EditingArg[] = [];

    types: VariableTypeDes[] = [];

    constructor(
        private constant: StrategyConstantService,
        private nzModal: NzModalService,
    ) { }

    ngOnInit() {
        this.types = this.constant.VARIABLE_TYPES.filter(item => this.isAlternation ? item.id !== VariableType.ENCRYPT_STRING_TYPE : item.id !== VariableType.BUTTON_TYPE);
    }

    delete(target: EditableStrategyMetaArg, index: number): void {
        this.nzModal.confirm({
            nzContent: SimpleNzConfirmWrapComponent,
            nzComponentParams: { content: 'DELETE_STRATEGY_ARG_CONFIRM', params: { name: target.name } },
            nzOnOk: this.deleteArg(index),
        });
    }

    startEdit(target: EditableStrategyMetaArg, index: number): void {
        target.editing = true;

        target.flag = Math.random();

        this.editingArgs.push({ index, originValue: omit({ ...target }, 'editing') });
    }

    cancelEdit(target: EditableStrategyMetaArg, index: number): void {
        target.editing = false;

        const idx = this.editingArgs.findIndex(item => item.originValue.flag === target.flag);

        this.data = [...this.data];

        this.data[index] = this.editingArgs[idx].originValue;

        this.editingArgs.splice(idx, 1);
    }

    saveEdit(target: EditableStrategyMetaArg, index: number): void {
        const positions = [];

        this.data.forEach((item, idx) => item.flag !== target.flag && (item.name === target.name || item.des === target.des) && positions.push(idx));

        const cleanEditingList = flag => this.editingArgs = this.editingArgs.filter(item => item.originValue.flag !== flag);

        if (positions.length > 0) {
            this.nzModal.confirm({
                nzContent: SimpleNzConfirmWrapComponent,
                nzComponentParams: { content: 'REMOVE_DUPLICATE_VARIABLE_CONFIRM', params: { index: positions.map(idx => idx + 1).join(',') } },
                nzOnOk: () => {
                    this.data = this.data.filter((_, index) => positions.indexOf(index) === -1);

                    target.editing = false;

                    cleanEditingList(target.flag);
                }
            });
        } else {
            target.editing = false;

            cleanEditingList(target.flag);
        }
    }

    private deleteArg = index => () => {
        this.removeArg.emit(this.data[index]);

        this.data = this.data.filter((_, idx) => idx !== index);
    }

    resetDefaultValue(index: number): void {
        const target = this.data[index];

        if (target.type === VariableType.BOOLEAN_TYPE || target.type === VariableType.NUMBER_TYPE) {
            target.defaultValue = 0;
        } else if (target.type === VariableType.BUTTON_TYPE) {
            target.defaultValue = this.constant.BUTTON_TYPE_VARIABLE_DEFAULT_VALUE;
        } else {
            target.defaultValue = '';
        }

        // save 的时候要验证这个值
    }


    /**
     * @description FIXME: 模板变量没有引用到，所以加了这个方法，why?
     */
    isSelectValueValid(str: string): boolean {
        return selectTypeValueFormat.test(str);
    }

    private addArg(value: StrategyMetaArg) {
        const index = this.data.findIndex(item => item.name === value.name || item.des === value.des);

        if (index < 0) {
            this.data = [...this.data, value];
        } else {
            /**
             * FIXME: Hack, because of the ExpressionChangedAfterIsHasBeenCheckedError.
             */
            setTimeout(() => {
                this.nzModal.confirm({
                    nzContent: SimpleNzConfirmWrapComponent,
                    nzComponentParams: { content: 'REMOVE_VARIABLE_CONFIRM' },
                    nzOnOk: () => {
                        this.data[index] = value;
                        this.data = [...this.data];
                    }
                });
            }, 0);
        }
    }

    private optimizeArg(arg: StrategyMetaArg): StrategyMetaArg {
        if (arg.type === VariableType.SELECT_TYPE) {
            return { ...arg, defaultValue: this.constant.withoutPrefix(arg.defaultValue, this.constant.LIST_PREFIX) };
        } else if (arg.type === VariableType.ENCRYPT_STRING_TYPE) {
            return { ...arg, defaultValue: this.constant.withoutPrefix(arg.defaultValue, this.constant.ENCRYPT_PREFIX) };
        } else if (arg.type === VariableType.BOOLEAN_TYPE) {
            return { ...arg, set defaultValue(value: any) { this._defaultValue = !!value }, get defaultValue() { return Number(this._defaultValue) }, _defaultValue: arg.defaultValue };
        } else {
            return arg;
        }
    }

}
