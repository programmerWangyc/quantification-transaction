import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { combineLatest, merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, mapTo } from 'rxjs/operators';

import { BacktestService } from '../../backtest/providers/backtest.service';
import { OpStrategyTokenType } from '../../interfaces/request.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-edit',
    templateUrl: './strategy-edit.component.html',
    styleUrls: ['./strategy-edit.component.scss']
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

        this.templates = combineLatest(
            this.strategyService.getStrategyDependance(),
            this.language
        ).pipe(
            map(([templates, language]) => templates.filter(item => item.language === language))
        );
    }

    /**
     * @ignore
     */
    launchPrivate() {
        this.privateSub$$ = this.strategyService.handleOpStrategyTokenError()
            /**
             *  Besides user active acquisition, it needs to check the strategy whether has token already.
             */
            .add(this.strategyService.launchOpStrategyToken(
                merge(
                    this.strategyService.hasToken(this.strategyId).pipe(
                        filter(has => has),
                        mapTo(OpStrategyTokenType.GET)
                    ),
                    this.opToken$
                ).pipe(
                    map(opCode => ({ opCode, strategyId: this.strategyId }))
                ))
            )
            .add(this.strategyService.updateStrategySecretKeyState(this.strategyId));
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        this.privateSub$$.add(this.strategyService.launchSaveStrategy(this.getSaveParams()));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.strategyService.resetState();

        this.subscription$$.unsubscribe();

        this.privateSub$$.unsubscribe();
    }
}
