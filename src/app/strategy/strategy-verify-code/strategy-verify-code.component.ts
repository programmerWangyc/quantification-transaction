import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { TipService } from '../../providers/tip.service';
import { GenKeyType, StrategyOperateService } from '../../strategy/providers/strategy.operate.service';

@Component({
    selector: 'app-strategy-verify-code',
    templateUrl: './strategy-verify-code.component.html',
    styleUrls: ['./strategy-verify-code.component.scss'],
})
export class StrategyVerifyCodeComponent implements BaseComponent {
    subscription$$: Subscription;

    verify$: Subject<string> = new Subject();

    type: number;

    id: number;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY', path: '../../../' }, { name: 'VERIFY_CODE' }];

    isCopyCode: boolean;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private strategyOperate: StrategyOperateService,
        private tip: TipService
    ) { }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.id = +this.route.snapshot.paramMap.get('id');

        this.type = +this.route.snapshot.paramMap.get('codeType');

        this.isCopyCode = this.type === GenKeyType.COPY_CODE;
    }

    launch() {
        this.subscription$$ = this.strategyOperate.launchVerifyKey(this.verify$
            .pipe(
                map(verifyCode => ({ strategyId: this.id, verifyCode }))
            )
        )
            .add(this.strategyOperate.isVerifyKeySuccess()
                .subscribe(isSuccess => this.handleVerifySuccess(isSuccess))
            )
            .add(this.strategyOperate.handleVerifyKeyError());
    }

    private handleVerifySuccess(isSuccess: boolean): void {
        if (isSuccess) {
            this.router.navigate(['../', '../', '../'], { relativeTo: this.route });
        } else {
            this.tip.messageError(this.isCopyCode ? 'INVALID_COPY_CODE_TIP' : 'INVALID_REGISTER_CODE_TIP');
        }
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
