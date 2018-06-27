import { Component, Input, OnInit } from '@angular/core';

import { VariableType } from '../../app.config';
import { VariableOverview } from '../../interfaces/app.interface';
import { booleanableVariableNameFormat, comparableVariableNameFormat } from '../../validators/validators';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { OptimizedVariableOverview } from '../backtest.interface';
import { BacktestService } from '../providers/backtest.service';

@Component({
    selector: 'app-backtest-strategy-args',
    templateUrl: './backtest-strategy-args.component.html',
    styleUrls: ['./backtest-strategy-args.component.scss'],
})
export class BacktestStrategyArgsComponent implements OnInit {
    @Input() title: string;

    @Input() isTemplate: boolean = false;

    @Input() id: number;

    @Input() set args(args: VariableOverview[]) {
        if (!args) return;

        this.data = args.map(arg => {

            if (arg.variableTypeId === VariableType.NUMBER_TYPE) {
                return this.optimizeArg(arg);
            } else if (arg.variableTypeId === VariableType.SELECT_TYPE) {
                return this.setSelectTypeDefaultValue(arg);
            } else if (arg.variableTypeId === VariableType.ENCRYPT_STRING_TYPE) {
                return { ...arg, variableValue: this.constant.withoutPrefix(<string>arg.variableValue, this.constant.ENCRYPT_PREFIX) };
            } else {
                return { ...arg };
            }
        });

        this.updateBacktestCodeContent();
    };

    data: Array<OptimizedVariableOverview & VariableOverview>;

    buttonPrefix: string;

    optimizeData: OptimizedVariableOverview[] = [];

    isHelpShow = true;

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
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

    /**
     * @description 判定依赖于其它参数的参数是否应该显示，依赖的条件应该是一个表达式
     * @example a@b>=2, 当b的值大于或等于2时应该向用户显示a参数；name@age<19,当 age 参数的值小于19时应该向用户展示name参数
     */
    comparableEstablishment(arg: VariableOverview): boolean {
        const [name, mainArgName, dependanceArgName, condition, predicateValue] = arg.variableName.match(comparableVariableNameFormat)

        let { variableValue, originValue } = this.data.find(arg => this.constant.removeConditionInName(arg.variableName) === dependanceArgName);

        // 如果依赖于列表类型的数据时，参与判断的值应该是当前值在列表中的索引，所以需要进行一下转换
        if (this.constant.isSpecialTypeArg(this.constant.LIST_PREFIX)(String(originValue))) {
            variableValue = this.constant.withoutPrefix(<string>originValue, this.constant.LIST_PREFIX).split('|').findIndex(item => item === variableValue);
        } else {
            // do nothing;
        }

        return eval(parseFloat(<string>variableValue) + condition + predicateValue);
    }

    /**
     * @description 判定依赖于其它参数的参数是否应该显示，依赖的条件被当作一个布尔值
     * @example a@b，当b的值为 true，或可以转为true 的值时，a参数才可以显示。a@!b，当b的值为 false，或者可以转换成 false 的值时a参数才可以显示。
     */
    booleanableEstablishment(arg: VariableOverview): boolean {
        const [name, mainArgName, predicateValue] = arg.variableName.match(booleanableVariableNameFormat)

        const [_, condition, dependanceArgName] = predicateValue.match(/(!*)(.+)/);

        const { variableValue } = this.data.find(arg => this.constant.removeConditionInName(arg.variableName) === dependanceArgName);

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

        this.updateBacktestCodeContent();

        this.optimizeData = this.data.filter(arg => arg.isOptimizing).map(arg => ({ ...arg }));
    }

    updateBacktestCodeContent(): void {
        const name = this.isTemplate ? this.title : this.constant.MAIN_CODE_FLAG;

        try {
            if (this.id === void 0 || this.id === null) {
                throw new Error('Component: BacktestStrategyArgsComponent needs id parameter, but there is no one passed in. It would cause an error during backtest.');
            } else {
                this.backtestService.updateBacktestCode({ name, args: this.data, id: this.id });
            }
        }catch(error) {
            console.warn(error.message);
        }
    }

    updateFilters(data: Filter[]): void {
        this.backtestService.updateBacktestArgFilters(data);
    }
}
