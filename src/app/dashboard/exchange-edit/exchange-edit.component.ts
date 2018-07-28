import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { SettingTypes } from '../../interfaces/request.interface';
import { PlatformDetail } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';
import { PublicService } from '../../providers/public.service';
import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-exchange-edit',
    templateUrl: './exchange-edit.component.html',
    styleUrls: ['./exchange-edit.component.scss'],
})
export class ExchangeEditComponent extends BaseComponent {
    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * platform detail
     */
    detail: Observable<PlatformDetail>;

    /**
     * brokers
     */
    brokers: Observable<string>;

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'EXCHANGE', path: '../' }, { name: 'ADD' }];

    constructor(
        private activateRoute: ActivatedRoute,
        private platformService: PlatformService,
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
    initialModel() {
        this.detail = this.platformService.getPlatformDetail();

        this.brokers = this.publicService.getSetting(SettingTypes.brokers);

        this.brokers.subscribe(v => console.log(v));
    }

    /**
     * @ignore
     */
    launch() {
        const id = this.activateRoute.paramMap.pipe(
            map(params => ({ id: +params.get('id') }))
        );

        this.subscription$$ = this.platformService.launchGetPlatformDetail(id);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }


}
