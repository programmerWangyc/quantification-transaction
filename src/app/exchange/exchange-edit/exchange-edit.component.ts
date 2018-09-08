import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { PlatformService } from '../../providers/platform.service';

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
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'EXCHANGE', path: '../' }, { name: 'EDIT' }];

    constructor(
        private activateRoute: ActivatedRoute,
        private platformService: PlatformService,
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
