import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { isNumber } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { Exchange } from '../../interfaces/response.interface';
import * as Actions from '../../store/exchange/exchange.action';
import { ExchangeConfig, UIState } from '../../store/exchange/exchange.reducer';
import * as fromRoot from '../../store/index.reducer';
import { ExchangeType } from '../exchange.config';
import { ExchangeConstantService } from './exchange.constant.service';

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
            this.selectTruth(fromRoot.selectExchangeUIState)
        );
    }

    /**
     * 交易所配置
     */
    getExchangeConfig(): Observable<ExchangeConfig> {
        return this.getExchangeUIState().pipe(
            map(state => state.exchange),
            filter(exchange => exchange.selectedTypeId !== null)
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
            const key = isNumber(config.selectedExchange) ? 'id' : 'eid'; // *编辑状态下 platformDetail 返回后，存入 store 的实际是交易所的 eid。

            return source.find(item => item[key] === config.selectedExchange);
        } else {
            return source.find(item => item.eid === this.constant.COMMON_PROTOCOL_EXCHANGE);
        }
    }

    /**
     * 获取锁定的交易所类型
     */
    getFreezeExchangeType(eidObs: Observable<string>): Observable<number> {
        return eidObs.pipe(
            map(eid => this.constant.eidToExchangeType(eid))
        );
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
