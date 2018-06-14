import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNumber } from 'lodash';

import { TipService } from '../../providers/tip.service';
import { OptimizedVariableOverview } from '../backtest-strategy-args/backtest-strategy-args.component';
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
        this.leftList = value.map(item => ({ ...item }));

        this.rightList = value.map(item => ({ ...item }));
    }

    @Output() optimize: EventEmitter<any> = new EventEmitter();

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

    ngOnInit() {
        this.conditions = this.constant.COMPARE_OPERATORS;

        this.selectedOperator = this.conditions[0];
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
    }

    checkValue(): void {
        if (!isNumber(this.selectedValue)) this.selectedValue = 1;
    }
}
