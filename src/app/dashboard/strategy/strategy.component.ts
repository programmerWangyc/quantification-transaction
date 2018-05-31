import { Component, OnInit } from '@angular/core';
import { StrategyService } from '../../strategy/providers/strategy.service';
import { BaseComponent } from '../../base/base.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { needArgsType, ShareStrategyRequest } from '../../interfaces/request.interface';
import { PlatformService } from '../../providers/platform.service';
import { BtNodeService } from '../../providers/bt-node.service';
import { Strategy } from '../../interfaces/response.interface';
import { Breadcrumb, ShareStrategyStateSnapshot } from '../../interfaces/constant.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';

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

    constructor(
        private strategyService: StrategyService,
        private btNodeService: BtNodeService,
        private platformService: PlatformService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private strategyOperate: StrategyOperateService,
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.strategyList = this.strategyService.getStrategies();
    }

    launch() {
        this.subscription$$ = this.strategyService.handleStrategyListError()
            .add(this.btNodeService.handleNodeListError())
            .add(this.platformService.handlePlatformListError())
            .add(this.strategyOperate.handleShareStrategyError())
            .add(this.strategyOperate.handleGenKeyError())
            .add(this.strategyOperate.launchShareStrategy(this.share$))
            .add(this.strategyOperate.remindPublishRobot())
            .add(this.strategyOperate.remindStoreGenKeyResult())
            .add(this.btNodeService.launchGetNodeList(Observable.of(true)))
            .add(this.platformService.launchGetPlatformList(Observable.of(true)))
            .add(this.strategyService.launchStrategyList(Observable.of({ offset: -1, limit: -1, strategyType: -1, categoryType: -1, needArgsType: needArgsType.none })))
    }

    navigateTo(path: string): void {
        this.router.navigate([path], { relativeTo: this.activatedRoute });
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
