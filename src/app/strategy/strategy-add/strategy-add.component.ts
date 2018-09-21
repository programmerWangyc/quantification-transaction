import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { CategoryType, needArgsType } from '../../interfaces/request.interface';
import { StrategyDetail } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { TipService } from '../../providers/tip.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyService } from '../providers/strategy.service';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-add',
    templateUrl: './strategy-add.component.html',
    styleUrls: ['./strategy-add.component.scss'],
})
export class StrategyAddComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy, AfterViewInit {




    templates: Observable<TemplateRefItem[]>;




    needShowTemplateDependance: Observable<boolean>;




    strategyDetail: Observable<StrategyDetail>;

    constructor(
        public backtest: BacktestService,
        public constant: StrategyConstantService,
        public nodeService: BtNodeService,
        public route: ActivatedRoute,
        public strategyOptService: StrategyOperateService,
        public strategyService: StrategyService,
        public tipService: TipService,
    ) {
        super(backtest, constant, nodeService, route, strategyOptService, strategyService, tipService);
    }




    ngOnInit() {
        this.initialModel(true);

        this.addCurrentPath('CREATE');

        this.initialPrivateModel();

        this.privateLaunch();
    }




    private initialPrivateModel() {
        this.templates = this.getTemplateDependance(this.strategyService.getAvailableDependance(true));

        this.needShowTemplateDependance = this.isShowTemplateDependance(this.templates);
    }




    private privateLaunch() {
        const keepAlive = () => this.isAlive;

        this.export$.asObservable().pipe(
            takeWhile(keepAlive)
        ).subscribe(content => this.exportFile(content));


        this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: CategoryType.TEMPLATE_LIBRARY, needArgsType: needArgsType.onlyStrategyArg }));

        this.nodeService.launchGetNodeList(of(true));

        this.strategyService.handleStrategyListError(keepAlive);

        this.strategyOptService.handleSaveStrategyError(keepAlive);
    }




    ngAfterViewInit() {
        this.strategyOptService.launchSaveStrategy(this.confirmBeforeRequest(-1).pipe(
            takeWhile(() => this.isAlive)
        ));
    }




    ngOnDestroy() {
        this.isAlive = false;

        this.strategyService.resetState();
    }
}
