import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as fromRoot from '../../store/index.reducer';
import { TipService } from '../../providers/tip.service';

export interface StrategyInfo {
    pricing?: string;
    id: number;
    username: string;
    email: string;
    name: string;
}

@Injectable()
export class SquareService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private tipService: TipService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * 通过名称查询策略详情
     */
    launchStrategyListByName(source: Observable<fromReq.GetStrategyListByNameRequest>): Subscription {
        return this.process.processStrategyListByName(source);
    }

    /**
     * 查询公共策略的详情信息
     */
    launchPublicStrategyDetail(source: Observable<fromReq.GetPublicStrategyDetailRequest>): Subscription {
        return this.process.processPublicStrategyDetail(source);
    }

    //  =======================================================Date acquisition=======================================================

    /**
     * 是否正在加载数据；
     */
    isLoading(): Observable<boolean> {
        return this.store.select(fromRoot.selectStrategyUIState).pipe(
            map(state => state && state.loading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    /**
     * @ignore
     */
    private getStrategyListByNameResponse(): Observable<fromRes.GetStrategyListByNameResponse> {
        return this.store.pipe(
            select(fromRoot.selectStrategyListByNameResponse),
            filter(res => !!res && !!res.result)
        );
    }

    /**
     * 策略广场的数据源
     */
    getMarketStrategyList(): Observable<fromRes.StrategyListByNameStrategy[]> {
        return this.getStrategyListByNameResponse().pipe(
            map(res => res.result.strategies)
        );
    }

    /**
     * 策略广场的数据总量
     */
    getMarketStrategyTotal(): Observable<number> {
        return this.getStrategyListByNameResponse().pipe(
            map(res => res.result.all)
        );
    }

    /**
     * @ignore
     */
    private getPublicStrategyDetailResponse(): Observable<fromRes.GetPublicStrategyDetailResponse> {
        return this.store.pipe(
            select(fromRoot.selectPublicStrategyDetailResponse),
            this.filterTruth()
        );
    }

    /**
     * 公共策略详情
     */
    getPublicStrategyDetail(): Observable<fromRes.PublicStrategyDetail> {
        return this.getPublicStrategyDetailResponse().pipe(
            map(res => res.result.strategy)
        );
    }

    //  =======================================================Local state change=======================================================

    //  =======================================================Shortcut methods=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleStrategyListByNameError(keepAlive: () => boolean = () => true): Subscription {
        return this.error.handleResponseError(this.getStrategyListByNameResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handlePublicStrategyDetailError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getPublicStrategyDetailResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
