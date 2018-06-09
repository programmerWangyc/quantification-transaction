import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';

import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { CategoryType } from '../../interfaces/request.interface';


@Component({
    selector: 'app-strategy-copy',
    templateUrl: './strategy-copy.component.html',
    styleUrls: ['./strategy-copy.component.scss']
})
export class StrategyCopyComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy {
    templates: Observable<TemplateRefItem[]>;

    needShowTemplateDependance: Observable<boolean>;

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public constant: StrategyConstantService,
    ) {
        super(route, strategyService, nodeService, nzModal, constant);
    }

    ngOnInit() {
        this.initialModel();

        this.launch(false);

        this.addCurrentPath('COPY');

        this.initialPrivateModel();
    }

    initialPrivateModel() {
        this.templates = this.strategyService.getCurrentDependance();

        this.needShowTemplateDependance = this.templates.map(list => !!list.length)
            .combineLatest(
                this.isTemplateCategorySelected.filter(sure => !sure),
                (hasTemplates, isNotTemplateCategory) => hasTemplates && isNotTemplateCategory
            );
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
