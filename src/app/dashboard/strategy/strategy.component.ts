import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isString } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { partition } from 'rxjs/operators';

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
    styleUrls: ['./strategy.component.scss']
})
export class StrategyComponent implements BaseComponent {
    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY' }];

    subscription$$: Subscription;

    strategyList: Observable<Strategy[]>;

    share$: Subject<ShareStrategyStateSnapshot> = new Subject();

    renewal$: Subject<Strategy> = new Subject();

    delete$: Subject<Strategy> = new Subject();

    isLoading: Observable<boolean>;

    constructor(
        private strategyService: StrategyService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private strategyOperate: StrategyOperateService,
        private nzModal: NzModalService,
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.strategyList = this.strategyService.getStrategies();

        this.isLoading = this.strategyService.isLoading();
    }

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
            .add(this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.none })))
    }

    navigateTo(path: string): void {
        this.router.navigate([path], { relativeTo: this.activatedRoute });
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
