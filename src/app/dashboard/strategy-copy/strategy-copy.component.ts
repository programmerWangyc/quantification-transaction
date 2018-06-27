import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { Observable ,  Subscription } from 'rxjs';

import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';


@Component({
    selector: 'app-strategy-copy',
    templateUrl: './strategy-copy.component.html',
    styleUrls: ['./strategy-copy.component.scss']
})
export class StrategyCopyComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy, AfterViewInit {
    templates: Observable<TemplateRefItem[]>;

    needShowTemplateDependance: Observable<boolean>;

    save$$: Subscription;

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

        this.initialPrivateLaunch();
    }

    initialPrivateModel() {
        this.templates = this.strategyService.getCurrentDependance()
            .combineLatest(this.language, (templates, language) => templates.filter(item => item.language === language));

        this.needShowTemplateDependance = this.templates.map(list => !!list.length)
            .combineLatest(
                this.isTemplateCategorySelected.filter(sure => !sure),
                (hasTemplates, isNotTemplateCategory) => hasTemplates && isNotTemplateCategory
            );
    }

    initialPrivateLaunch() {
    }

    ngAfterViewInit() {
        /**
         * @description 保存操作需要保证子组件渲染完成，参数需要父组件通过viewChild方式从子组件获取。
         */
        this.save$$ = this.strategyService.launchSaveStrategy(
            this.getSaveParams()
                .map(params => ({ ...params, id: -1 - this.strategyId }))
                .switchMap(params => {
                    const modal = this.nzModal.confirm({
                        nzContent: SimpleNzConfirmWrapComponent,
                        nzComponentParams: { content: 'STRATEGY_COPY_SAVE_CONFIRM' },
                        nzOnOk: () => modal.close(true)
                    });

                    return modal.afterClose.filter(sure => !!sure).mapTo(params);
                })
        );
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.save$$.unsubscribe();
    }
}
