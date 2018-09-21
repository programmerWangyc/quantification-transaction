import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { VariableType } from '../../app.config';
import { VariableOverview } from '../../interfaces/app.interface';
import { GroupedList, UtilService } from '../../providers/util.service';
import { booleanableVariableNameFormat, comparableVariableNameFormat } from '../../validators/validators';
import { Filter } from '../arg-optimizer/arg-optimizer.component';
import { OptimizedVariableOverview } from '../backtest.interface';
import { BacktestConstantService } from '../providers/backtest.constant.service';
import { BacktestService } from '../providers/backtest.service';

type Variable = OptimizedVariableOverview & VariableOverview;

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

        this.groupedData = this.utilService.getGroupedStrategyArgs(this.data, this.constant.getArgumentGroupName(this.constant.ARG_GROUP_FLAG_REG));

        this.updateBacktestCodeContent();
    }

    data: Variable[];

    groupedData: Observable<GroupedList<Variable>[]>;

    buttonPrefix: string;

    optimizeData: OptimizedVariableOverview[] = [];

    isHelpShow = true;

    constructor(
        private constant: BacktestConstantService,
        private backtestService: BacktestService,
        private utilService: UtilService,
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

    private comparableEstablishment(arg: VariableOverview): boolean {
        const [, , dependanceArgName, condition, predicateValue] = arg.variableName.match(comparableVariableNameFormat);

        // tslint:disable-next-line:prefer-const
        let { variableValue, originValue } = this.data.find(argument => this.constant.removeConditionInName(argument.variableName) === dependanceArgName);

        if (this.constant.isSpecialTypeArg(this.constant.LIST_PREFIX)(String(originValue))) {
            variableValue = this.constant.withoutPrefix(<string>originValue, this.constant.LIST_PREFIX).split('|').findIndex(item => item === variableValue);
        } else {
            // do nothing;
        }

        // tslint:disable-next-line:no-eval
        return eval(parseFloat(<string>variableValue) + condition + predicateValue);
    }

    private booleanableEstablishment(arg: VariableOverview): boolean {
        const [, , predicateValue] = arg.variableName.match(booleanableVariableNameFormat);

        const [, condition, dependanceArgName] = predicateValue.match(/(!*)(.+)/);

        const { variableValue } = this.data.find(argument => this.constant.removeConditionInName(argument.variableName) === dependanceArgName);

        // tslint:disable-next-line:no-eval
        return eval(condition + variableValue);
    }

    isButton(value: any): boolean {
        return this.constant.isButton(value);
    }

    private optimizeArg(arg: VariableOverview): OptimizedVariableOverview {
        const optimize = this.constant.getOptimizeSetting(<number>arg.originValue);

        return { ...arg, isOptimizing: false, optimize };
    }

    private setSelectTypeDefaultValue(arg: VariableOverview): VariableOverview {
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
        } catch (error) {
            console.warn(error.message);
        }
    }

    updateFilters(data: Filter[]): void {
        this.backtestService.updateBacktestArgFilters(data);
    }
}
