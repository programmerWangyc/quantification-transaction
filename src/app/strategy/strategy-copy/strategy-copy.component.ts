import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { BtNodeService } from '../../providers/bt-node.service';
import { TipService } from '../../providers/tip.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyService } from '../providers/strategy.service';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-copy',
    templateUrl: './strategy-copy.component.html',
    styleUrls: ['./strategy-copy.component.scss'],
})
export class StrategyCopyComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy, AfterViewInit {

    /**
     * 策略所依赖的模板
     */
    templates: Observable<TemplateRefItem[]>;

    /**
     * 是否需要显示模板依赖
     */
    needShowTemplateDependance: Observable<boolean>;

    constructor(
        public backtest: BacktestService,
        public constant: StrategyConstantService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public route: ActivatedRoute,
        public strategyOptService: StrategyOperateService,
        public strategyService: StrategyService,
        public tipService: TipService,
    ) {
        super(backtest, constant, nodeService, route, strategyOptService, strategyService, tipService);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch(false);

        this.addCurrentPath('COPY');

        this.initialPrivateModel();
    }

    /**
     * @ignore
     */
    initialPrivateModel() {
        this.templates = this.getTemplateDependance(this.strategyService.getCurrentDependance());

        this.needShowTemplateDependance = this.isShowTemplateDependance(this.templates);
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        this.strategyOptService.launchSaveStrategy(this.confirmBeforeRequest(-1 - this.strategyId).pipe(
            takeWhile(() => this.isAlive)
        ));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();

        this.strategyService.resetState();
    }
}
