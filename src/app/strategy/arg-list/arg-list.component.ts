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
    symbol: Symbol;
}

export interface EditingArg {
    symbol: Symbol;
    originValue: EditableStrategyMetaArg;
}

@Component({
    selector: 'app-arg-list',
    templateUrl: './arg-list.component.html',
    styleUrls: ['./arg-list.component.scss'],
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




    private editingArgs: EditingArg[] = [];




    types: VariableTypeDes[] = [];

    constructor(
        private constant: StrategyConstantService,
        private nzModal: NzModalService,
    ) { }




    ngOnInit() {
        this.types = this.constant.VARIABLE_TYPES.filter(item => this.isAlternation ? item.id !== VariableType.ENCRYPT_STRING_TYPE : item.id !== VariableType.BUTTON_TYPE);
    }




    delete(target: EditableStrategyMetaArg): void {
        this.nzModal.confirm({
            nzContent: SimpleNzConfirmWrapComponent,
            nzComponentParams: { content: 'DELETE_STRATEGY_ARG_CONFIRM', params: { name: target.name } },
            nzOnOk: this.deleteArg(target),
        });
    }






    startEdit(target: EditableStrategyMetaArg): void {
        target.editing = true;

        this.editingArgs.push({ symbol: target.symbol, originValue: omit({ ...target }, 'editing') });
    }





    cancelEdit(target: EditableStrategyMetaArg): void {
        target.editing = false;

        const editingIdx = this.editingArgs.findIndex(item => item.originValue.symbol === target.symbol);

        this.data = [...this.data];

        const dataIdx = this.data.findIndex(item => item.symbol === target.symbol);

        this.data[dataIdx] = this.editingArgs[editingIdx].originValue;

        this.editingArgs.splice(editingIdx, 1);
    }






    saveEdit(target: EditableStrategyMetaArg): void {
        const positions: number[] = [];

        this.data.forEach((item, idx) => item.symbol !== target.symbol && (item.name === target.name || item.des === target.des) && positions.push(idx));

        const cleanEditingList = symbol => this.editingArgs = this.editingArgs.filter(item => item.originValue.symbol !== symbol);

        if (positions.length > 0) {
            this.nzModal.confirm({
                nzContent: SimpleNzConfirmWrapComponent,
                nzComponentParams: { content: 'REMOVE_DUPLICATE_VARIABLE_CONFIRM', params: { index: positions.map(idx => idx + 1).join(',') } },
                nzOnOk: () => {
                    this.data = this.data.filter((_, index) => !positions.includes(index));

                    target.editing = false;

                    cleanEditingList(target.symbol);
                },
            });
        } else {
            target.editing = false;

            cleanEditingList(target.symbol);
        }
    }





    private deleteArg = (target: EditableStrategyMetaArg) => () => {
        this.removeArg.emit(target);

        this.data = this.data.filter(item => item.symbol !== target.symbol);
    }




    resetDefaultValue(index: number): void {
        const target = this.data[index];

        if (target.type === VariableType.BOOLEAN_TYPE || target.type === VariableType.NUMBER_TYPE) {
            target.defaultValue = 0;
        } else if (target.type === VariableType.BUTTON_TYPE) {
            target.defaultValue = this.constant.VALUE_OF_BUTTON_TYPE_ARG;
        } else {
            target.defaultValue = '';
        }


    }





    isSelectValueValid(str: string): boolean {
        return selectTypeValueFormat.test(str);
    }




    private addArg(value: StrategyMetaArg) {
        const index = this.data.findIndex(item => item.name === value.name || item.des === value.des);

        if (index < 0) {
            this.data = [...this.data, { ...value, symbol: Symbol() }];
        } else {



            setTimeout(() => {
                this.nzModal.confirm({
                    nzContent: SimpleNzConfirmWrapComponent,
                    nzComponentParams: { content: 'REMOVE_VARIABLE_CONFIRM' },
                    nzOnOk: () => {
                        this.data[index] = { ...value, symbol: Symbol() };
                        this.data = [...this.data];
                    },
                });
            }, 0);
        }
    }





    private optimizeArg(arg: StrategyMetaArg): EditableStrategyMetaArg {
        if (arg.type === VariableType.SELECT_TYPE) {
            return { ...arg, defaultValue: this.constant.withoutPrefix(arg.defaultValue, this.constant.LIST_PREFIX), symbol: Symbol() };
        } else if (arg.type === VariableType.ENCRYPT_STRING_TYPE) {
            return { ...arg, defaultValue: this.constant.withoutPrefix(arg.defaultValue, this.constant.ENCRYPT_PREFIX), symbol: Symbol() };
        } else if (arg.type === VariableType.BOOLEAN_TYPE) {
            return { ...arg, set defaultValue(value: any) { this._defaultValue = !!value; }, get defaultValue() { return Number(this._defaultValue); }, _defaultValue: arg.defaultValue, symbol: Symbol() };
        } else {
            return { ...arg, symbol: Symbol() };
        }
    }

}
