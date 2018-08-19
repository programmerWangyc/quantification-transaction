import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { CategoryType, needArgsType } from '../../interfaces/request.interface';
import { StrategyDetail } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-add',
    templateUrl: './strategy-add.component.html',
    styleUrls: ['./strategy-add.component.scss'],
})
export class StrategyAddComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy, AfterViewInit {

    /**
     * 可使用的模板
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

    /**
     * 策略
     */
    strategyDetail: Observable<StrategyDetail>;

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public constant: StrategyConstantService,
        public backtest: BacktestService,
    ) {
        super(route, strategyService, nodeService, nzModal, constant, backtest);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel(true);

        this.addCurrentPath('CREATE', '../');

        this.initialPrivateModel();

        this.initialPrivateLaunch();
    }

    /**
     * @ignore
     */
    initialPrivateModel() {
        this.templates = combineLatest(
            this.strategyService.getAvailableDependance(true),
            this.language
        ).pipe(
            map(([templates, language]) => templates.filter(item => item.language === language))
        );

        this.needShowTemplateDependance = combineLatest(
            this.templates.pipe(
                map(list => !!list.length)
            ),
            this.isTemplateCategorySelected
        ).pipe(
            map(([hasTemplates, isTemplateCategory]) => hasTemplates && !isTemplateCategory)
        );
    }

    /**
     * @ignore
     */
    initialPrivateLaunch() {
        this.subscription$$ = this.strategyService.handleStrategyListError()
            .add(this.strategyService.handleSaveStrategyError())
            // 响应用户导出文件的操作
            .add(this.export$.subscribe(content => this.exportFile(content)))
            // 只获取属于模板类库的策略
            .add(this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: CategoryType.TEMPLATE_LIBRARY, needArgsType: needArgsType.onlyStrategyArg })))
            .add(this.nodeService.launchGetNodeList(of(true)));
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        this.save$$ = this.strategyService.launchSaveStrategy(this.confirmBeforeRequest(-1)); // 为啥是-1，我也不知道；
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.save$$.unsubscribe();

        this.subscription$$.unsubscribe();
    }
}
