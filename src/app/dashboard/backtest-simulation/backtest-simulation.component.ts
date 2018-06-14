import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { TemplateVariableOverview, VariableOverview } from '../../interfaces/app.interface';
import { ConstantService } from '../../providers/constant.service';
import { StrategyService } from '../../strategy/providers/strategy.service';

@Component({
    selector: 'app-backtest-simulation',
    templateUrl: './backtest-simulation.component.html',
    styleUrls: ['./backtest-simulation.component.scss']
})
export class BacktestSimulationComponent implements OnInit {
    @Input() category: number;

    @Input() language: number = 0;

    fixedKlinePeriodId$: Subject<number> = new Subject();

    strategyArgs: Observable<VariableOverview[]>;

    templateArgs: Observable<TemplateVariableOverview[]>;

    constructor(
        private strategyService: StrategyService,
        private constant: ConstantService,
    ) { }

    ngOnInit() {
        this.strategyArgs = this.strategyService.getExistedStrategyArgs(() => true).startWith([])
            .map(args => args.filter(arg => !this.constant.isCommandArg(arg.variableName)));

        // this.templateArgs = this.strategyService.getStrategyDetail().map(detail => detail)
    }
}
