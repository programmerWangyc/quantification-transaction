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

    /**
     * 是交互参数
     */
    @Input() isAlternation = false;

    /**
     * 需要添加的参数，或参数集合
     */
    @Input() set param(value: StrategyMetaArg | StrategyMetaArg[]) {
        if (!value) return;

        if (Array.isArray(value)) {
            this.data = value.map(item => this.optimizeArg(item));
        } else {
            this.addArg(this.optimizeArg(value));
        }
    }

    /**
     * 输出从列表中删除掉的参数；
     */
    @Output() removeArg: EventEmitter<StrategyMetaArg> = new EventEmitter();


    /**
     * 可编辑的参数
     */
    data: EditableStrategyMetaArg[] = [];

    /**
     * 处于编辑状态的参数
     */
    editingArgs: EditingArg[] = [];

    /**
     * 参数的可选类型
     */
    types: VariableTypeDes[] = [];

    constructor(
        private constant: StrategyConstantService,
        private nzModal: NzModalService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.types = this.constant.VARIABLE_TYPES.filter(item => this.isAlternation ? item.id !== VariableType.ENCRYPT_STRING_TYPE : item.id !== VariableType.BUTTON_TYPE);
    }

    /**
     * 删除参数前的确认函数；
     */
    delete(target: EditableStrategyMetaArg, index: number): void {
        this.nzModal.confirm({
            nzContent: SimpleNzConfirmWrapComponent,
            nzComponentParams: { content: 'DELETE_STRATEGY_ARG_CONFIRM', params: { name: target.name } },
            nzOnOk: this.deleteArg(index),
        });
    }

    /**
     * 进入参数编辑状态
     * @param target 参数
     * @param index 在列表中的位置
     */
    startEdit(target: EditableStrategyMetaArg, index: number): void {
        target.editing = true;

        target.flag = Math.random();

        this.editingArgs.push({ index, originValue: omit({ ...target }, 'editing') });
    }

    /**
     * 取消参数的编辑状态
     * @param target 参数
     * @param index 在列表中的位置
     */
    cancelEdit(target: EditableStrategyMetaArg, index: number): void {
        target.editing = false;

        const idx = this.editingArgs.findIndex(item => item.originValue.flag === target.flag);

        this.data = [...this.data];

        this.data[index] = this.editingArgs[idx].originValue;

        this.editingArgs.splice(idx, 1);
    }

    /**
     * 保存编辑过的参数
     * @param target 参数
     * @param index 在列表中的位置
     */
    saveEdit(target: EditableStrategyMetaArg, index: number): void {
        const positions: number[] = [];

        this.data.forEach((item, idx) => item.flag !== target.flag && (item.name === target.name || item.des === target.des) && positions.push(idx));

        const cleanEditingList = flag => this.editingArgs = this.editingArgs.filter(item => item.originValue.flag !== flag);

        if (positions.length > 0) {
            this.nzModal.confirm({
                nzContent: SimpleNzConfirmWrapComponent,
                nzComponentParams: { content: 'REMOVE_DUPLICATE_VARIABLE_CONFIRM', params: { index: positions.map(idx => idx + 1).join(',') } },
                nzOnOk: () => {
                    this.data = this.data.filter((_, index) => !positions.includes(index));

                    target.editing = false;

                    cleanEditingList(target.flag);
                }
            });
        } else {
            target.editing = false;

            cleanEditingList(target.flag);
        }
    }

    /**
     * 删除参数；
     * 柯里化前的函数；
     */
    private deleteArg = index => () => {
        this.removeArg.emit(this.data[index]);

        this.data = this.data.filter((_, idx) => idx !== index);
    }

    /**
     * 将参数的值重置为默认值；
     */
    resetDefaultValue(index: number): void {
        const target = this.data[index];

        if (target.type === VariableType.BOOLEAN_TYPE || target.type === VariableType.NUMBER_TYPE) {
            target.defaultValue = 0;
        } else if (target.type === VariableType.BUTTON_TYPE) {
            target.defaultValue = this.constant.VALUE_OF_BUTTON_TYPE_ARG;
        } else {
            target.defaultValue = '';
        }

        // save 的时候要验证这个值
    }


    /**
     * FIXME: 模板变量没有引用到，所以加了这个方法，why?
     * Hack method;
     */
    isSelectValueValid(str: string): boolean {
        return selectTypeValueFormat.test(str);
    }

    /**
     * 在现在参数表格上添加新的参数；
     */
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

    /**
     * 参数显示前的优化函数，主要用来去掉一些标识符；
     * @param arg 策略参数
     */
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
