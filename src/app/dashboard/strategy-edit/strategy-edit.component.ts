import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { OpStrategyTokenType } from '../../interfaces/request.interface';
import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { TemplateRefItem } from '../../strategy/strategy-dependance/strategy-dependance.component';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';
import { StrategyConstantService } from '../../strategy/providers/strategy.constant.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-strategy-edit',
    templateUrl: './strategy-edit.component.html',
    styleUrls: ['./strategy-edit.component.scss']
})
export class StrategyEditComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy {

    opToken$: Subject<number> = new Subject();

    secretKey: Observable<string>;

    templates: Observable<TemplateRefItem[]>;

    privateSub$$: Subscription;

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
        this.addCurrentPath('EDIT');

        this.initialModel();

        this.launch(false);

        this.initialPrivateModel();

        this.launchPrivate();
    }

    initialPrivateModel() {
        this.secretKey = this.strategyService.getStrategyToken();

        this.templates = this.strategyService.getStrategyDependance();
    }

    launchPrivate() {
        this.privateSub$$ = this.strategyService.handleOpStrategyTokenError()
            /**
             * @description Besides user active acquisition, it needs to check the strategy whether has token already.
             */
            .add(this.strategyService.launchOpStrategyToken(this.strategyService.hasToken(this.strategyId)
                .filter(has => has).mapTo(OpStrategyTokenType.GET).merge(this.opToken$).map(opCode => ({ opCode, strategyId: this.strategyId })))
            )
            .add(this.strategyService.updateStrategySecretKeyState(this.strategyId));
    }

    ngOnDestroy() {
        this.strategyService.resetState();

        this.subscription$$.unsubscribe();

        this.privateSub$$.unsubscribe();
    }
}
