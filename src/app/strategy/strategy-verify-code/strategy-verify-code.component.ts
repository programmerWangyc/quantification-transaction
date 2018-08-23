import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { takeWhile } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import { GenKeyType } from '../../strategy/providers/strategy.operate.service';

@Component({
    selector: 'app-strategy-verify-code',
    templateUrl: './strategy-verify-code.component.html',
    styleUrls: ['./strategy-verify-code.component.scss'],
})
export class StrategyVerifyCodeComponent implements BaseComponent {

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY', path: '../../../' }, { name: 'VERIFY_CODE' }];

    verify$: Subject<string> = new Subject();

    type: number;

    id: number;

    isCopyCode: boolean;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private tip: TipService,
        private publicService: PublicService,
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
        const keepAlive = () => this.isAlive;

        this.publicService.launchVerifyKey(this.verify$
            .pipe(
                map(verifyCode => ({ strategyId: this.id, verifyCode })),
                takeWhile(keepAlive)
            )
        );

        this.publicService.isVerifyKeySuccess(keepAlive)
            .subscribe(isSuccess => this.handleVerifySuccess(isSuccess));

        this.publicService.handleVerifyKeyError(keepAlive);
    }

    private handleVerifySuccess(isSuccess: boolean): void {
        if (isSuccess) {
            this.router.navigate(['../', '../', '../'], { relativeTo: this.route });
        } else {
            this.tip.messageError(this.isCopyCode ? 'INVALID_COPY_CODE_TIP' : 'INVALID_REGISTER_CODE_TIP');
        }
    }

    ngOnDestroy() {
        this.isAlive = false;
    }

}
