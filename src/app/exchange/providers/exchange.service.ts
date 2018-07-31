import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as Actions from '../../store/exchange/exchange.action';
import { ExchangeConfig, UIState } from '../../store/exchange/exchange.reducer';
import * as fromRoot from '../../store/index.reducer';
import { ExchangeType } from '../exchange.config';
import { ExchangeConstantService } from './exchange.constant.service';
import { Exchange } from '../../interfaces/response.interface';

@Injectable()
export class ExchangeService extends BaseService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private constant: ExchangeConstantService,
    ) {
        super();
    }


    // ========================================Data acquisition==================================

    /**
     * @ignore
     */
    private getExchangeUIState(): Observable<UIState> {
        return this.store.pipe(
            select(fromRoot.selectExchangeUIState),
            this.filterTruth()
        );
    }

    /**
     * 交易所配置
     */
    getExchangeConfig(): Observable<ExchangeConfig> {
        return this.getExchangeUIState().pipe(
            map(state => state.exchange),
            this.filterTruth()
        );
    }

    /**
     * 通过配置信息获取指定的平台
     */
    getTargetExchange<T extends Exchange>(config: ExchangeConfig, source: T[]): T {
        const { selectedTypeId } = config;

        if (selectedTypeId === ExchangeType.futures) {
            return source.find(item => item.eid === this.constant.FUTURES_CTP);
        } else if (selectedTypeId === ExchangeType.eSunny) {
            return source.find(item => item.eid === this.constant.FUTURES_ESUNNY);
        } else if (selectedTypeId === ExchangeType.currency) {
            return source.find(item => item.id === config.selectedExchange);
        } else {
            return source.find(item => item.eid === this.constant.COMMON_PROTOCOL_EXCHANGE);
        }
    }

    // ========================================Local date update===================================

    /**
     * @ignore
     */
    updateExchangeType(typeObs: Observable<number>): Subscription {
        return typeObs.subscribe(type => this.store.dispatch(new Actions.UpdateSelectedExchangeTypeAction(type)));
    }

    /**
     * @ignore
     */
    updateExchange(exchangeObs: Observable<number>): Subscription {
        return exchangeObs.subscribe(exchange => this.store.dispatch(new Actions.UpdateSelectedExchangeAction(exchange)));
    }

    /**
     * @ignore
     */
    updateExchangeRegion(regionObs: Observable<number>): Subscription {
        return regionObs.subscribe(region => this.store.dispatch(new Actions.UpdateSelectedExchangeRegionAction(region)));
    }

    /**
     * @ignore
     */
    updateExchangeProvider(providerObs: Observable<number>): Subscription {
        return providerObs.subscribe(provider => this.store.dispatch(new Actions.UpdateSelectedExchangeProviderAction(provider)));
    }

    /**
     * @ignore
     */
    updateExchangeQuotaServer(serverObs: Observable<string>): Subscription {
        return serverObs.subscribe(server => this.store.dispatch(new Actions.UpdateSelectedExchangeQuotaServerAction(server)));
    }

    /**
     * @ignore
     */
    updateExchangeTradeServer(serverObs: Observable<string>): Subscription {
        return serverObs.subscribe(server => this.store.dispatch(new Actions.UpdateSelectedExchangeTradeServerAction(server)));
    }

    /**
     * @ignore
     */
    resetState(): void {
        this.store.dispatch(new Actions.ResetStateAction());
    }
}
