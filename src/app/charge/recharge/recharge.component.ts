import { Component, OnDestroy, OnInit } from '@angular/core';

import { ChargeService } from '../../charge/providers/charge.service';
import { Breadcrumb, DeactivateGuard } from '../../interfaces/app.interface';

@Component({
    selector: 'app-recharge',
    templateUrl: './recharge.component.html',
    styleUrls: ['./recharge.component.scss'],
})
export class RechargeComponent implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_RECHARGE' }];

    constructor(
        private chargeService: ChargeService
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * 路由守卫
     */
    canDeactivate(): DeactivateGuard[] {
        const chargeComplete: DeactivateGuard = {
            canDeactivate: this.chargeService.isRechargeSuccess(),
            message: 'CHARGE_LEAVE_CONFIRM',
        };

        return [chargeComplete];
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.chargeService.resetRecharge();
    }

}
