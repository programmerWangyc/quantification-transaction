import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { StrategyDetail } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { TipService } from '../../providers/tip.service';
import { StrategyConstantService } from '../providers/strategy.constant.service';
import { StrategyOperateService } from '../providers/strategy.operate.service';
import { StrategyService } from '../providers/strategy.service';
import { StrategyCreateMetaComponent, Tab } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-backtest',
    templateUrl: './strategy-backtest.component.html',
    styleUrls: ['./strategy-backtest.component.scss'],
})
export class StrategyBacktestComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy {

    tabs: Tab[] = [
        { name: 'SIMULATE_BACKTEST', icon: 'anticon-rocket', active: true },
        { name: 'DESCRIPTION', icon: 'anticon-tags-o-', active: false },
        { name: 'MANUAL', icon: 'anticon', active: false },
    ];

    description: Observable<string>;

    manual: Observable<string>;

    constructor(
        public backtestService: BacktestService,
        public constant: StrategyConstantService,
        public nodeService: BtNodeService,
        public route: ActivatedRoute,
        public strategyOptService: StrategyOperateService,
        public strategyService: StrategyService,
        public tipService: TipService,
    ) {
        super(backtestService, constant, nodeService, route, strategyOptService, strategyService, tipService);
    }

    ngOnInit() {
        this.addCurrentPath('BACKTEST');

        this.launch(true);

        this.initialModel(false);

        this.privateInitialModel();
    }

    private privateInitialModel(): void {
        this.description = this.strategy.pipe(
            map((strategy: StrategyDetail) => strategy.description)
        );

        this.manual = this.strategy.pipe(
            map((strategy: StrategyDetail) => strategy.manual)
        );
    }

    ngOnDestroy() {
        this.isAlive = false;
    }
}
