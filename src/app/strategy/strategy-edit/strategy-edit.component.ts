import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, mapTo } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { OpStrategyTokenType } from '../../interfaces/request.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { TipService } from '../../providers/tip.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyService } from '../providers/strategy.service';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-edit',
    templateUrl: './strategy-edit.component.html',
    styleUrls: ['./strategy-edit.component.scss'],
})
export class StrategyEditComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy, AfterViewInit {

    /**
     * 策略编辑密钥操作的类型；
     */
    opToken$: Subject<number> = new Subject();

    /**
     * 策略操作的密钥
     */
    secretKey: Observable<string>;

    templates: Observable<TemplateRefItem[]>;

    privateSub$$: Subscription;

    /**
     * 是否需要显示模板依赖
     */
    needShowTemplateDependance: Observable<boolean>;

    constructor(
        public backtest: BacktestService,
        public constant: StrategyConstantService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
        public route: ActivatedRoute,
        public strategyOptService: StrategyOperateService,
        public strategyService: StrategyService,
        public tipService: TipService,
    ) {
        super(backtest, constant, nodeService, route, strategyOptService, strategyService, tipService);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.addCurrentPath('EDIT');

        this.initialModel();

        this.launch(false);

        this.initialPrivateModel();

        this.launchPrivate();
    }

    /**
     * @ignore
     */
    initialPrivateModel() {
        this.secretKey = this.strategyService.getStrategyToken();

        this.templates = this.getTemplateDependance(this.strategyService.getStrategyDependance());

        this.needShowTemplateDependance = this.isShowTemplateDependance(this.templates);
    }

    /**
     * @ignore
     */
    launchPrivate() {
        /**
         *  Besides user active acquisition, it needs to check the strategy whether has token already.
         */
        this.privateSub$$ = this.strategyService.launchOpStrategyToken(
            merge(
                this.strategyService.hasToken(this.strategyId).pipe(
                    filter(has => has),
                    mapTo(OpStrategyTokenType.GET)
                ),
                this.opToken$
            ).pipe(
                map(opCode => ({ opCode, strategyId: this.strategyId }))
            ))
            .add(this.strategyService.updateStrategySecretKeyState(this.strategyId));

        this.strategyService.handleOpStrategyTokenError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        this.privateSub$$.add(this.strategyOptService.launchSaveStrategy(this.getSaveParams()));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.strategyService.resetState();

        this.subscription$$.unsubscribe();

        this.privateSub$$.unsubscribe();
    }
}
