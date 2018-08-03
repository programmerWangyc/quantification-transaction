import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';
import { DeactivateGuard } from '../dashboard.interface';
import { ChargeService } from '../../charge/providers/charge.service';
import { CanDeactivateComponent } from '../providers/guard.service';

@Component({
    selector: 'app-strategy-rent',
    templateUrl: './strategy-rent.component.html',
    styleUrls: ['./strategy-rent.component.scss'],
})
export class StrategyRentComponent implements CanDeactivateComponent, OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY' }, { name: 'STRATEGY_RENT' }];

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
