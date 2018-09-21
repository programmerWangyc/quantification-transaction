import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { merge, Observable, of as observableOf, Subscription } from 'rxjs';
import {
    distinctUntilChanged, distinctUntilKeyChanged, filter, map, mapTo, takeWhile, withLatestFrom
} from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { keepAliveFn } from '../../interfaces/app.interface';
import {
    GetPaymentArgResponse, GetPayOrdersResponse, GetStrategyListResponse, PayOrder, Strategy
} from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { ResetRechargeAction, ResetPaymentArgumentsAction } from '../../store/charge/charge.action';
import * as fromRoot from '../../store/index.reducer';
import { PaymentMethod } from '../charge.config';
import { getChargePrice } from '../pipes/charge.pipe';
import { ChargeConstantService } from './charge.constant.service';
import { orderBy } from 'lodash';

export interface RechargeFormModal {
    payMethod: number;
    charge: number;
}

export interface RentPrice {
    price: number;
    days: number;
    discount: number;
}

@Injectable()
export class ChargeService extends BaseService {

    private renderer2: Renderer2;

    alipayAddress = 'https://mapi.alipay.com/gateway.do';

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        public rendererFactory: RendererFactory2,
        public constant: ChargeConstantService,
    ) {
        super();
        this.renderer2 = this.rendererFactory.createRenderer(null, null);
    }

    //  =======================================================Server request=======================================================

    launchPaymentArg(data: Observable<RechargeFormModal>, strategyIdObs: Observable<number> = observableOf(0)): Subscription {
        return this.process.processPaymentArg(
            data.pipe(withLatestFrom(
                strategyIdObs,
                ({ payMethod, charge }, strategyId) => ({ payMethod, chargeAmount: charge, strategyId })
            ))
        );
    }

    launchPayOrders(data: Observable<any>): Subscription {
        return this.process.processPayOrders(data);
    }

    private getPaymentArgsResponse(): Observable<GetPaymentArgResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectPaymentArgResponse)
        );
    }

    private goToPaymentPage(payMethod: number): Observable<GetPaymentArgResponse> {
        return this.getPaymentArgsResponse().pipe(
            withLatestFrom(this.store.select(fromRoot.selectPaymentArgRequestParams)),
            filter(([_, req]) => !!req && (req.payMethod === payMethod)),
            map(([res, _]) => res)
        );
    }

    goToAlipayPage(): Subscription {
        return this.goToPaymentPage(PaymentMethod.ALIPAY).pipe(
            map(res => {
                const form: HTMLFormElement = this.renderer2.createElement('form');

                form.method = 'GET';

                form.action = this.alipayAddress;

                Object.entries(res.result.form).forEach(([key, value]) => {
                    const input: HTMLInputElement = this.renderer2.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                this.renderer2.appendChild(document.body, form);

                form.submit();

                return form;
            })
        ).subscribe(form => this.renderer2.removeChild(document.body, form));
    }

    goToPayPal(): Subscription {
        return this.goToPaymentPage(PaymentMethod.PAY_PAL)
            .subscribe(res => location.href = res.result.code_url);
    }

    getWechatQrCode(): Observable<string> {
        return this.goToPaymentPage(PaymentMethod.WECHAT).pipe(
            map(res => res.result.code_url),
            distinctUntilChanged()
        );
    }

    private getPayOrdersResponse(): Observable<GetPayOrdersResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectPayOrdersResponse)
        );
    }

    getHistoryOrders(): Observable<PayOrder[]> {
        return this.getPayOrdersResponse().pipe(
            map(res => res.result.items)
        );
    }

    getSpecificHistoryOrders(flag: string): Observable<PayOrder[]> {
        const predicate = this.isSpecificOrder(flag);

        return this.getHistoryOrders().pipe(
            map(orders => orders.filter(predicate)),
            map(orders => orderBy(orders, ['id'], ['desc']))
        );
    }

    private isSpecificOrder(flag: string): (order: PayOrder) => boolean {
        return order => order.order_guid.indexOf(flag) !== -1;
    }

    getHistoryOrderTotalAmount(data: Observable<PayOrder[]>): Observable<number> {
        return data.pipe(
            map(orders => orders.reduce((acc, cur) => acc + getChargePrice(cur.order_guid, this.constant.RECHARGE_PAYMENT_FLAG), 0))
        );
    }

    chargeAlreadySuccess(): Observable<boolean> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectServerSendRechargeMessage),
            mapTo(true)
        );
    }

    isRechargeSuccess(): Observable<boolean> {
        return this.store.select(fromRoot.selectServerSendRechargeMessage).pipe(
            map(res => !!res && !!res.orderId)
        );
    }

    getChargeStrategy(idObs: Observable<number>): Observable<Strategy> {
        return merge(
            this.store.pipe(
                select(fromRoot.selectStrategyListResponse),
                filter(res => !!res && !!res.result.strategies.length),
            ),
            this.store.pipe(
                select(fromRoot.selectStrategyListByNameResponse),
                filter(res => !!res && !!res.result.strategies.length),
            ) as Observable<GetStrategyListResponse>,
        ).pipe(
            withLatestFrom(
                idObs,
                ({ result }, id) => result.strategies.find(item => item.id === id)
            ),
            this.filterTruth(),
            distinctUntilKeyChanged('id')
        );
    }

    parsePricing(info: string): RentPrice[] {
        const data = info.split(',');

        let basePrice = 0;

        return data.map((item, index) => {
            const [price, days] = item.split('/');

            if (index === 0) {
                basePrice = Number(price) / Number(days);

                return { price: Number(price), days: Number(days), discount: 0 };
            } else {
                const discount = basePrice * Number(days) - Number(price);

                return { price: Number(price), days: Number(days), discount };
            }
        });
    }

    resetRecharge(): void {
        this.store.dispatch(new ResetRechargeAction());
    }

    resetPaymentArgumentsRes(signal: Observable<any>): Subscription {
        return signal.subscribe(_ => this.store.dispatch(new ResetPaymentArgumentsAction()));
    }

    handlePaymentsArgsError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getPaymentArgsResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handlePayOrdersError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getPayOrdersResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
