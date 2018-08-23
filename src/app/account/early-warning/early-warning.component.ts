import { Component, OnInit } from '@angular/core';

import { of } from 'rxjs';

import { Breadcrumb } from '../../interfaces/app.interface';
import { PublicService } from '../../providers/public.service';
import { FormTypeBaseComponent } from '../base/base';

@Component({
    selector: 'app-early-warning',
    templateUrl: './early-warning.component.html',
    styleUrls: ['./early-warning.component.scss'],
})
export class EarlyWarningComponent extends FormTypeBaseComponent implements OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'BALANCE_EARLY_WARNING' }];

    /**
     * @ignore
     */
    amount: number = 0;

    /**
     * @ignore
     */
    labelSm = 12;

    constructor(
        private publicService: PublicService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    launch() { }

    /**
     * @ignore
     */
    initialModel() { }

    /**
     * @ignore
     */
    onSet(amount: number) {
        this.publicService.launchChangeAlertThresholdSetting(of(amount));
    }

    /**
     * @ignore
     */
    ngOnDestroy() { }
}
