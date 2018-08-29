import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { BtNodeService } from '../../providers/bt-node.service';
import { TipService } from '../../providers/tip.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
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

    /**
     * @ignore
     */
    save$$: Subscription;

    constructor(
        public backtest: BacktestService,
        public constant: StrategyConstantService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public tipService: TipService,
    ) {
        super(backtest, constant, nodeService, route, strategyService, tipService);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch(false);

        this.addCurrentPath('COPY');

        this.initialPrivateModel();

        this.initialPrivateLaunch();
    }

    /**
     * @ignore
     */
    initialPrivateModel() {
        this.templates = combineLatest(
            this.strategyService.getCurrentDependance(),
            this.language
        ).pipe(
            map(([templates, language]) => templates.filter(item => item.language === language)),
        );

        this.needShowTemplateDependance = combineLatest(
            this.templates.pipe(
                map(list => !!list.length)
            ),
            this.isTemplateCategorySelected.pipe(
                filter(sure => !sure)
            )
        ).pipe(
            map(([hasTemplates, isNotTemplateCategory]) => hasTemplates && isNotTemplateCategory)
        );
    }

    /**
     * @ignore
     */
    initialPrivateLaunch() {
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        this.save$$ = this.strategyService.launchSaveStrategy(this.confirmBeforeRequest(-1 - this.strategyId));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.save$$.unsubscribe();
    }
}
