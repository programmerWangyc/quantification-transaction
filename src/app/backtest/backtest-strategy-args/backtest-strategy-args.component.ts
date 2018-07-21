import { Component, Input, OnInit } from '@angular/core';

import { VariableType } from '../../app.config';
import { VariableOverview } from '../../interfaces/app.interface';
import { booleanableVariableNameFormat, comparableVariableNameFormat } from '../../validators/validators';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { OptimizedVariableOverview } from '../backtest.interface';
import { BacktestConstantService } from '../providers/backtest.constant.service';
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

    /**
     * @ignore
     */
    ngOnInit() {
        this.buttonPrefix = this.constant.COMMAND_PREFIX;
    }

    /**
     * 是否隐藏当前参数;
     */
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
     * 判定依赖于其它参数的参数是否应该显示，依赖的条件是一个表达式
     * @example a@b>=2, 当b的值大于或等于2时应该向用户显示a参数；name@age<19,当 age 参数的值小于19时应该向用户展示name参数
     */
    private comparableEstablishment(arg: VariableOverview): boolean {
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
     * 判定依赖于其它参数的参数是否应该显示，依赖的条件被当作一个布尔值
     * @example a@b，当b的值为 true，或可以转为true 的值时，a参数才可以显示。a@!b，当b的值为 false，或者可以转换成 false 的值时a参数才可以显示。
     */
    private booleanableEstablishment(arg: VariableOverview): boolean {
        const [name, mainArgName, predicateValue] = arg.variableName.match(booleanableVariableNameFormat)

        const [_, condition, dependanceArgName] = predicateValue.match(/(!*)(.+)/);

        const { variableValue } = this.data.find(arg => this.constant.removeConditionInName(arg.variableName) === dependanceArgName);

        return eval(condition + variableValue);
    }

    /**
     * 传入的值是否按钮类型的值。
     */
    isButton(value: any): boolean {
        return this.constant.isButton(value);
    }

    /**
     * 增加数字类型的参数的调优配置。
     */
    private optimizeArg(arg: VariableOverview): OptimizedVariableOverview {
        const optimize = this.constant.getOptimizeSetting(<number>arg.originValue);

        return { ...arg, isOptimizing: false, optimize };
    }

    /**
     * 设置 select 类型的参数的默认值。
     */
    private setSelectTypeDefaultValue(arg: VariableOverview): VariableOverview {
        const variableValue = this.constant.withoutPrefix(<string>arg.variableValue, this.constant.LIST_PREFIX).split('|')[0];

        return { ...arg, variableValue };
    }

    /**
     * 当用户切换参数的调优状态时，更新回测代码的中各参数的状态，同时更新参数过滤器中的数据。
     */
    checkOptimizingData(value: OptimizedVariableOverview): void {
        value.isOptimizing = !value.isOptimizing;

        this.updateBacktestCodeContent();

        this.optimizeData = this.data.filter(arg => arg.isOptimizing).map(arg => ({ ...arg }));
    }

    /**
     * 更新回测代码的中各参数的状态
     */
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

    /**
     * 更新过滤器到store中
     * @param data 过滤器数组
     */
    updateFilters(data: Filter[]): void {
        this.backtestService.updateBacktestArgFilters(data);
    }
}
