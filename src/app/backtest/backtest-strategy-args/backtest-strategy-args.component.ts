import { Component, Input, OnInit } from '@angular/core';

import { VariableType } from '../../app.config';
import { ArgOptimizeSetting, VariableOverview } from '../../interfaces/app.interface';
import { booleanableVariableNameFormat, comparableVariableNameFormat } from '../../validators/validators';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { BacktestConstantService } from '../providers/backtest.constant.service';

export interface OptimizedVariableOverview extends VariableOverview {
    isOptimizing?: boolean;
    optimize?: ArgOptimizeSetting;
}

@Component({
    selector: 'app-backtest-strategy-args',
    templateUrl: './backtest-strategy-args.component.html',
    styleUrls: ['./backtest-strategy-args.component.scss'],
})
export class BacktestStrategyArgsComponent implements OnInit {
    @Input() title: string;

    @Input() isTemplate: boolean = false;

    @Input() set args(args: VariableOverview[]) {
        this.data = args.map(arg => {
            arg.variableTypeId === VariableType.NUMBER_TYPE ? this.optimizeArg(arg) : { ...arg }
            if (arg.variableTypeId === VariableType.NUMBER_TYPE) {
                return this.optimizeArg(arg);
            } else if (arg.variableTypeId === VariableType.SELECT_TYPE) {
                return this.setSelectTypeDefaultValue(arg);
            } else {
                return { ...arg };
            }
        });
    };

    data: Array<OptimizedVariableOverview & VariableOverview>;

    buttonPrefix: string;

    optimizeData: OptimizedVariableOverview[] = [];

    isHelpShow = true;

    constructor(
        private constant: BacktestConstantService,
    ) { }

    ngOnInit() {
        this.buttonPrefix = this.constant.COMMAND_PREFIX;
    }

    isHide(arg: VariableOverview): boolean {
        const comparable = comparableVariableNameFormat.test(arg.variableName);

        const booleanable = booleanableVariableNameFormat.test(arg.variableName);

        if (comparable) {
            return !this.comparableEstablishment(arg);
        } else if (booleanable) {
            return !this.booleanableEstablishment(arg);
        } else {
            return false;
        }
    }

    comparableEstablishment(arg: VariableOverview): boolean {
        const [name, mainArgName, dependanceArgName, condition, predicateValue] = arg.variableName.match(comparableVariableNameFormat)

        let { variableValue, originValue } = this.data.find(arg => arg.variableName.split('@')[0] === dependanceArgName);

        // 如果依赖于列表类型的数据时，参与判断的值应该是当前值在列表中的索引，所以需要进行一下转换
        if (this.constant.isSpecialTypeArg(this.constant.LIST_PREFIX)(String(originValue))) {
            variableValue = this.constant.withoutPrefix(<string>originValue, this.constant.LIST_PREFIX).split('|').findIndex(item => item === variableValue);
        } else {
            // do nothing;
        }

        return eval(variableValue + condition + predicateValue);
    }

    booleanableEstablishment(arg: VariableOverview): boolean {
        const [name, mainArgName, predicateValue] = arg.variableName.match(booleanableVariableNameFormat)

        const [_, condition, dependanceArgName] = predicateValue.match(/(!*)(.+)/);

        const { variableValue } = this.data.find(arg => arg.variableName.split('@')[0] === dependanceArgName);

        return eval(condition + variableValue);
    }

    isButton(value: any): boolean {
        return this.constant.isButton(value);
    }

    optimizeArg(arg: VariableOverview): OptimizedVariableOverview {
        const optimize = this.constant.getOptimizeSetting(<number>arg.originValue);

        return { ...arg, isOptimizing: false, optimize };
    }

    setSelectTypeDefaultValue(arg: VariableOverview): VariableOverview {
        const variableValue = this.constant.withoutPrefix(<string>arg.variableValue, this.constant.LIST_PREFIX).split('|')[0];

        return { ...arg, variableValue };
    }

    checkOptimizingData(value: OptimizedVariableOverview): void {
        value.isOptimizing = !value.isOptimizing;

        this.optimizeData = this.data.filter(arg => arg.isOptimizing).map(arg => ({ ...arg }));
    }

    addOptimizer(data: Filter): void {
        console.log(data);
    }
}
