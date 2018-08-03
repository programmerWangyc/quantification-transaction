import { Component, OnDestroy, OnInit } from '@angular/core';

import { ChargeService } from '../../charge/providers/charge.service';
import { Breadcrumb } from '../../interfaces/app.interface';
import { DeactivateGuard } from '../dashboard.interface';

@Component({
    selector: 'app-recharge',
    templateUrl: './recharge.component.html',
    styleUrls: ['./recharge.component.scss'],
})
export class RechargeComponent implements OnInit, OnDestroy {

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'ACCOUNT_RECHARGE' }];

    constructor(
        private chargeService: ChargeService
    ) { }

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

    ngOnDestroy() {
        this.chargeService.resetRecharge();
    }

}
