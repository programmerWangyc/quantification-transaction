import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { VariableOverview } from '../../interfaces/app.interface';
import { TemplateSnapshot } from '../../interfaces/response.interface';
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

    templates: Observable<TemplateSnapshot[]>;

    constructor(
        private strategyService: StrategyService,
    ) { }

    ngOnInit() {
        this.strategyArgs = this.strategyService.getExistedStrategyArgs(() => true).startWith([])
            .map(args => args.filter(arg => !this.strategyService.isCommandArg(arg.variableName)));

        this.templates = this.strategyService.getStrategyDetail()
            .filter(detail => !!detail.templates)
            .map(detail => detail.templates);
    }
}
