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
        if (value.length < 2) {
            this.filters.length > 0 && this.optimize.emit([]);
            this.filters = [];
            return;
        } else {
            this.leftList = value.map(item => ({ ...item }));

            this.rightList = value.map(item => ({ ...item }));
        }
        !!this.filters.length && this.checkFilters(value);
        this.checkSelectedVariable(value);
    }

    @Output() optimize: EventEmitter<Filter[]> = new EventEmitter();

    leftList: OptimizedVariableOverview[] = [];

    selectedLeftVariable: OptimizedVariableOverview;

    rightList: OptimizedVariableOverview[] = [];

    selectedRightVariable: OptimizedVariableOverview;

    operators: CompareOperator[];

    selectedOperator: CompareOperator;

    selectedValue: number = 1;

    filters: Filter[] = [];

    constructor(
        private constant: BacktestConstantService,
        private tip: TipService,
    ) { }

    ngOnInit() {
        this.operators = this.constant.COMPARE_OPERATORS;

        this.selectedOperator = this.operators[0];
    }

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

    deleteFilter(index: number): void {
        this.filters = this.filters.filter((_, idx) => idx !== index);

        this.optimize.emit(this.filters);
    }

    checkValue(): void {
        if (!isNumber(this.selectedValue)) this.selectedValue = 1;
    }

    private checkFilters(data: OptimizedVariableOverview[]): void {
        const names = data.map(item => item.variableName);

        this.filters = this.filters.filter(item => {
            const { comparedVariable, compareVariable } = item;

            return names.includes(compareVariable.variableName) && names.includes(comparedVariable.variableName);
        });

        this.optimize.emit(this.filters);
    }

    checkSelectedVariable(data: OptimizedVariableOverview[]): void {
        const isValid = (value: OptimizedVariableOverview): any => data.find(item => item.variableName === value.variableName);

        this.selectedLeftVariable = this.selectedLeftVariable && isValid(this.selectedLeftVariable) && this.selectedLeftVariable;

        this.selectedRightVariable = this.selectedRightVariable && isValid(this.selectedRightVariable) && this.selectedRightVariable;
    }
}
