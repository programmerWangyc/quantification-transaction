import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNumber } from 'lodash';

import { TipService } from '../../providers/tip.service';
import { OptimizedVariableOverview } from '../backtest.interface';
import { BacktestConstantService, CompareOperator } from '../providers/backtest.constant.service';

export interface Filter {
    compareVariable: OptimizedVariableOverview;
    comparedVariable: OptimizedVariableOverview;
    logic: CompareOperator;
    baseValue: number;
}

@Component({
    selector: 'app-arg-optimizer',
    templateUrl: './arg-optimizer.component.html',
    styleUrls: ['./arg-optimizer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArgOptimizerComponent implements OnInit {
    @Input() set data(value: OptimizedVariableOverview[]) {
        // Filter need two variables at least;
        if (value.length < 2) {
            this.filters.length > 0 && this.optimize.emit([]);
            this.filters = [];
            return;
        } else {
            this.leftList = value.map(item => ({ ...item }));

            this.rightList = value.map(item => ({ ...item }));
        }

        //检查当前所有的参数过滤器，删除被移除调优的参数；
        !!this.filters.length && this.checkFilters(value);

        this.checkSelectedVariable(value);
    }

    @Output() optimize: EventEmitter<Filter[]> = new EventEmitter();

    leftList: OptimizedVariableOverview[] = [];

    selectedLeftVariable: OptimizedVariableOverview;

    rightList: OptimizedVariableOverview[] = [];

    selectedRightVariable: OptimizedVariableOverview;

    conditions: CompareOperator[];

    selectedOperator: CompareOperator;

    selectedValue: number = 1;

    filters: Filter[] = [];

    constructor(
        private constant: BacktestConstantService,
        private tip: TipService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.conditions = this.constant.COMPARE_OPERATORS;

        this.selectedOperator = this.conditions[0];
    }

    /**
     * Add filter then emit filters;
     */
    addFilter() {
        if (this.selectedLeftVariable.variableDes === this.selectedRightVariable.variableDes) {
            this.tip.messageError('COMPARE_EQUAL_TO_COMPARED');
            return;
        }

        const filter = { comparedVariable: { ...this.selectedRightVariable }, compareVariable: { ...this.selectedLeftVariable }, logic: { ...this.selectedOperator }, baseValue: this.selectedValue };

        const position = this.filters.findIndex(item => item.compareVariable.variableDes === this.selectedLeftVariable.variableDes && item.comparedVariable.variableDes === this.selectedRightVariable.variableDes);

        if (position < 0) {
            this.filters = [...this.filters, filter];
        } else {
            this.filters[position] = filter;

            this.filters = [...this.filters];
        }

        this.optimize.emit(this.filters);
    }

    /**
     * Remove the filter then emit filters;
     * @param index Index of the filter need to delete;
     */
    deleteFilter(index: number): void {
        this.filters = this.filters.filter((_, idx) => idx !== index);

        this.optimize.emit(this.filters);
    }

    /**
     * Check compare value;
     */
    checkValue(): void {
        if (!isNumber(this.selectedValue)) this.selectedValue = 1;
    }

    /**
     * 检查过滤器，如果有已经被移出调优的参数，需要将对应的过滤器删除；
     */
    private checkFilters(data: OptimizedVariableOverview[]): void {
        const names = data.map(item => item.variableName);

        this.filters = this.filters.filter(item => {
            const { comparedVariable, compareVariable } = item;

            return names.includes(compareVariable.variableName) && names.includes(comparedVariable.variableName);
        });

        this.optimize.emit(this.filters);
    }

    /**
     * 检查左右下拉框中的值是否仍然有效；
     */
    checkSelectedVariable(data: OptimizedVariableOverview[]): void {
        const isValid = (value: OptimizedVariableOverview): any => data.find(item => item.variableName === value.variableName);

        this.selectedLeftVariable = this.selectedLeftVariable && isValid(this.selectedLeftVariable) && this.selectedLeftVariable;

        this.selectedRightVariable = this.selectedRightVariable && isValid(this.selectedRightVariable) && this.selectedRightVariable;
    }
}
