import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { isString } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { map, partition, startWith } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { needArgsType } from '../../interfaces/request.interface';
import { Strategy } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { PlatformService } from '../../providers/platform.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { StrategyService } from '../../strategy/providers/strategy.service';
import { StrategyRenewalComponent } from '../../strategy/strategy-renewal/strategy-renewal.component';
import { ShareStrategyStateSnapshot } from '../../strategy/strategy.interface';

@Component({
    selector: 'app-strategy',
    templateUrl: './strategy.component.html',
    styleUrls: ['./strategy.component.scss'],
})
export class StrategyComponent implements BaseComponent {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY' }];

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * 策略列表
     */
    strategyList: Observable<Strategy[]>;

    /**
     * 公开
     */
    share$: Subject<ShareStrategyStateSnapshot> = new Subject();

    /**
     * 续费
     */
    renewal$: Subject<Strategy> = new Subject();

    /**
     * 删除
     */
    delete$: Subject<Strategy> = new Subject();

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * 搜索名称中包含指定关键字的策略
     */
    search: FormControl = new FormControl();

    constructor(
        private strategyService: StrategyService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private strategyOperate: StrategyOperateService,
        private nzModal: NzModalService,
    ) {
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel() {
        this.strategyList = combineLatest(
            this.strategyService.getStrategies(),
            this.search.valueChanges.pipe(
                startWith('')
            )
        ).pipe(
            map(([list, keyword]) => list.filter(item => item.name.includes(keyword)))
        );

        this.isLoading = this.strategyService.isLoading();
    }

    /**
     * @ignore
     */
    launch() {
        const [renewalByPay, renewalByCode] = partition(({ pricing }) => isString(pricing) && pricing.indexOf('/') !== -1)(this.renewal$);

        this.subscription$$ = this.strategyService.handleStrategyListError()
            .add(this.btNodeService.handleNodeListError())
            .add(this.platformService.handlePlatformListError())
            .add(this.strategyOperate.handleShareStrategyError())
            .add(this.strategyOperate.handleGenKeyError())
            .add(this.strategyOperate.handleDeleteStrategyError())
            .add(this.strategyOperate.launchDeleteStrategy(this.delete$))
            .add(this.strategyOperate.launchShareStrategy(this.share$))
            .add(this.strategyOperate.remindPublishRobot())
            .add(this.strategyOperate.remindStoreGenKeyResult())
            .add(renewalByCode.subscribe(({ name, username, email, id }) => this.nzModal.create({
                nzContent: StrategyRenewalComponent,
                nzComponentParams: { name, author: username, email, id },
                nzFooter: null,
            })))
            .add(renewalByPay.subscribe((strategy: Strategy) => this.router.navigate(['rent', strategy.id], { relativeTo: this.activatedRoute })))
            .add(this.btNodeService.launchGetNodeList(of(true)))
            .add(this.platformService.launchGetPlatformList(of(true)))
            .add(this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.none })));
    }

    /**
     * Navigate to other pate;
     * @param path target route;
     */
    navigateTo(path: string, isRelativeToParent = false): void {
        this.router.navigate([path], { relativeTo: isRelativeToParent ? this.activatedRoute.parent : this.activatedRoute });
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
