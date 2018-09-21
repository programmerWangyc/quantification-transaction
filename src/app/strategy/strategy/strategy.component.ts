import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { isString } from 'lodash';
import { NzModalService } from 'ng-zorro-antd';
import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { map, partition, startWith, takeWhile } from 'rxjs/operators';

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



    paths: Breadcrumb[] = [{ name: 'STRATEGY_LIBRARY' }];




    subscription$$: Subscription;




    strategyList: Observable<Strategy[]>;




    share$: Subject<ShareStrategyStateSnapshot> = new Subject();




    renewal$: Subject<Strategy> = new Subject();




    delete$: Subject<Strategy> = new Subject();




    isLoading: Observable<boolean>;




    search: FormControl = new FormControl();




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




    ngOnInit() {
        this.initialModel();

        this.launch();
    }




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




    launch() {



        this.subscription$$ = this.strategyOperate.launchDeleteStrategy(this.delete$.asObservable())
            .add(this.strategyOperate.launchShareStrategy(this.share$.asObservable()));

        this.btNodeService.launchGetNodeList(of(true));

        this.platformService.launchGetPlatformList(of(true));

        this.strategyService.launchStrategyList(of({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.none }));




        const keepAlive = () => this.isAlive;

        const [renewalByPay, renewalByCode] = partition(({ pricing }) => isString(pricing) && pricing.includes('/'))(this.renewal$.asObservable().pipe(
            takeWhile(keepAlive)
        ));

        renewalByCode.subscribe(({ name, username, email, id }) => this.nzModal.create({
            nzContent: StrategyRenewalComponent,
            nzComponentParams: { name, author: username, email, id },
            nzFooter: null,
        }));

        renewalByPay.subscribe((strategy: Strategy) => this.router.navigate([Path.charge, Path.rent, strategy.id], { relativeTo: this.activatedRoute.parent }));




        this.strategyOperate.remindPublishRobot(keepAlive);

        this.strategyOperate.remindStoreGenKeyResult(keepAlive);




        this.strategyService.handleStrategyListError(keepAlive);

        this.btNodeService.handleNodeListError(keepAlive);

        this.platformService.handlePlatformListError(keepAlive);

        this.strategyOperate.handleShareStrategyError(keepAlive);

        this.strategyOperate.handleGenKeyError(keepAlive);

        this.strategyOperate.handleDeleteStrategyError(keepAlive);
    }




    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();

        this.strategyService.resetState();
    }
}
