import { Component } from '@angular/core';

import { Observable, of, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { TableStatistics } from '../../interfaces/app.interface';
import { Platform } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';

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
    statisticsParams: Observable<TableStatistics>;

    /**
     * page size
     */
    pageSize = 20;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private platform: PlatformService,
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

        this.statisticsParams = this.list.pipe(
            map(data => this.platform.getTableStatistics(data.length, this.pageSize))
        );
    }

    /**
     * @ignore
     */
    launch() {
        const keepAlive = () => this.isAlive;

        this.subscription$$ = this.platform.launchDeletePlatform(this.delete$.asObservable());

        this.platform.launchGetPlatformList(of(true));

        this.platform.handlePlatformListError(keepAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }

}
