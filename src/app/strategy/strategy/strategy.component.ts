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
import { ShareStrategyStateSnapshot } from '../../strategy/strategy.interface';
import { Path } from '../../app.config';
import { StrategyRenewalComponent } from '../../tool/strategy-renewal/strategy-renewal.component';

@Component({
    selector: 'app-strategy',
    templateUrl: './strategy.component.html',
    styleUrls: ['./strategy.component.scss'],
})
export class StrategyComponent implements BaseComponent {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER', path: '../../' }, { name: 'STRATEGY_LIBRARY' }];

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

    /**
     * @ignore
     */
    isAlive = true;

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
        const [renewalByPay, renewalByCode] = partition(({ pricing }) => isString(pricing) && pricing.includes('/'))(this.renewal$.asObservable());

        const keepAlive = () => this.isAlive;

        this.subscription$$ = this.strategyOperate.launchDeleteStrategy(this.delete$.asObservable())
            .add(this.strategyOperate.launchShareStrategy(this.share$.asObservable()))
            .add(this.strategyOperate.remindPublishRobot())
            .add(this.strategyOperate.remindStoreGenKeyResult())
            .add(renewalByCode.subscribe(({ name, username, email, id }) => this.nzModal.create({
                nzContent: StrategyRenewalComponent,
                nzComponentParams: { name, author: username, email, id },
                nzFooter: null,
            })))
            .add(renewalByPay.subscribe((strategy: Strategy) => this.router.navigate([Path.charge, Path.rent, strategy.id], { relativeTo: this.activatedRoute.parent })));

        this.btNodeService.launchGetNodeList(of(true));

        this.platformService.launchGetPlatformList(of(true));

        this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.none }));

        this.strategyService.handleStrategyListError(keepAlive);

        this.btNodeService.handleNodeListError(keepAlive);

        this.platformService.handlePlatformListError(keepAlive);

        this.strategyOperate.handleShareStrategyError(keepAlive);

        this.strategyOperate.handleGenKeyError(keepAlive);

        this.strategyOperate.handleDeleteStrategyError(keepAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }
}
