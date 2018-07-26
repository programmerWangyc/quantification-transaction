import { Component } from '@angular/core';

import { Observable, of, Subject, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { Platform } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-exchange-list',
    templateUrl: './exchange-list.component.html',
    styleUrls: ['./exchange-list.component.scss'],
})
export class ExchangeListComponent extends BaseComponent {
    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * source data of agents;
     */
    list: Observable<Platform[]>;

    /**
     * @ignore
     */
    tableHead: string[] = ['NAME', 'EXCHANGE_PAIR', 'OPERATE'];

    /**
     * 删除
     */
    delete$: Subject<Platform> = new Subject();

    /**
     * 是否正在加载
     */
    isLoading: Observable<boolean>;

    /**
     * 数量统计
     */
    statistics: Observable<boolean>;

    /**
     * page size
     */
    pageSize = 20;

    constructor(
        private platform: PlatformService,
        private translate: TranslateService,
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
        this.list = this.platform.getPlatformList();

        this.isLoading = this.platform.isPlatformLoading();

        this.statistics = this.list.pipe(
            mergeMap(data => this.translate.get('PAGINATION_STATISTICS', { total: data.length, page: Math.ceil(data.length / this.pageSize) }))
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.platform.handlePlatformListError()
            .add(this.platform.launchDeletePlatform(this.delete$))
            .add(this.platform.launchGetPlatformList(of(true), true));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
