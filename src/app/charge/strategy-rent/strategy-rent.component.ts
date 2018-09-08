import { Component, OnInit } from '@angular/core';

import { CanDeactivateComponent } from '../../base/guard.service';
import { ChargeService } from '../../charge/providers/charge.service';
import { Breadcrumb, DeactivateGuard } from '../../interfaces/app.interface';

@Component({
    selector: 'app-strategy-rent',
    templateUrl: './strategy-rent.component.html',
    styleUrls: ['./strategy-rent.component.scss'],
})
export class StrategyRentComponent implements CanDeactivateComponent, OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_LIBRARY' }, { name: 'STRATEGY_RENT' }];

    constructor(
        private chargeService: ChargeService,
    ) { }

    ngOnInit() {
    }

    /**
     * Router guard.
     */
    canDeactivate(): DeactivateGuard[] {
        const chargeComplete: DeactivateGuard = {
            canDeactivate: this.chargeService.isRechargeSuccess(),
            message: 'CHARGE_LEAVE_CONFIRM',
        };

        return [chargeComplete];
    }

}
