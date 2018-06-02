import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { OpStrategyTokenType } from '../../interfaces/request.interface';
import { StrategyService } from '../../strategy/providers/strategy.service';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';

@Component({
    selector: 'app-strategy-edit',
    templateUrl: './strategy-edit.component.html',
    styleUrls: ['./strategy-edit.component.scss']
})
export class StrategyEditComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy {

    opToken$: Subject<number> = new Subject();

    secretKey: Observable<string>;

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyService,
    ) {
        super(route, strategyService);
    }

    ngOnInit() {
        this.addCurrentPath('EDIT');

        this.initialModel();

        this.launch();

        this.initialPrivateModel();

        this.launchPrivate();
    }

    initialPrivateModel() {
        this.secretKey = this.strategyService.getStrategyToken();
    }

    launchPrivate() {
        this.subscription$$.add(this.strategyService.handleOpStrategyTokenError())
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
    }
}
