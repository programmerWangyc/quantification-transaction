import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { merge, Observable, of as observableOf, Subscription } from 'rxjs';
import { distinctUntilChanged, distinctUntilKeyChanged, filter, map, mapTo, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import {
    GetPaymentArgResponse, GetPayOrdersResponse, GetStrategyListResponse, PayOrder, Strategy
} from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { ResetRechargeAction } from '../../store/charge/charge.action';
import * as fromRoot from '../../store/index.reducer';
import { PaymentMethod } from '../charge.config';
import { getChargePrice } from '../pipes/charge.pipe';

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
            )
            )
        );
    }

    launchPayOrders(data: Observable<any>): Subscription {
        return this.process.processPayOrders(data);
    }

    //  =======================================================Date Acquisition=======================================================

    /**
     * 支付参数接口的响应
     */
    private getPaymentArgsResponse(): Observable<GetPaymentArgResponse> {
        return this.store.pipe(
            select(fromRoot.selectPaymentArgResponse),
            this.filterTruth()
        );
    }

    /**
     * 跳转到相应的支付页面
     * @param payMethod 支付方式
     */
    private goToPaymentPage(payMethod: number): Observable<GetPaymentArgResponse> {
        return this.getPaymentArgsResponse().pipe(
            withLatestFrom(this.store.select(fromRoot.selectPaymentArgRequestParams)),
            filter(([_, req]) => !!req && (req.payMethod === payMethod)),
            map(([res, _]) => res)
        );
    }

    /**
     * 跳转到支付宝付款页面
     */
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
        )
            .subscribe(form => this.renderer2.removeChild(document.body, form));
    }

    /**
     * 跳转到payPal 支付页面
     */
    goToPayPal(): Subscription {
        return this.goToPaymentPage(PaymentMethod.PAY_PAL)
            .subscribe(res => location.href = res.result.code_url);
    }

    /**
     * 获取微信扫描二维码
     */
    getWechatQrCode(): Observable<string> {
        return this.goToPaymentPage(PaymentMethod.WECHAT).pipe(
            map(res => res.result.code_url),
            distinctUntilChanged()
        );
    }

    /**
     * 获取支付订单的响应
     */
    private getPayOrdersResponse(): Observable<GetPayOrdersResponse> {
        return this.store.select(fromRoot.selectPayOrdersResponse).pipe(
            filter(this.isTruth)
        );
    }

    /**
     * 获取历史订单
     */
    getHistoryOrders(): Observable<PayOrder[]> {
        return this.getPayOrdersResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * 获取指定标识的订单
     * @param flag 订单标识
     */
    getSpecificHistoryOrders(flag: string): Observable<PayOrder[]> {
        const predicate = this.isSpecificOrder(flag);

        return this.getHistoryOrders().pipe(
            map(orders => orders.filter(predicate))
        );
    }

    /**
     * 是否指定标识的订单
     * @param flag 订单标识
     */
    private isSpecificOrder(flag: string): (order: PayOrder) => boolean {
        return order => order.order_guid.indexOf(flag) !== -1;
    }

    /**
     * 获取订单总额
     * @param data 订单数据
     */
    getHistoryOrderTotalAmount(data: Observable<PayOrder[]>): Observable<number> {
        return data.pipe(
            map(orders => orders.reduce((acc, cur) => acc + getChargePrice(cur.order_guid), 0))
        );
    }

    /**
     * 充值成功
     */
    chargeAlreadySuccess(): Observable<boolean> {
        return this.store.select(fromRoot.selectServerSendRechargeMessage).pipe(
            this.filterTruth(),
            mapTo(true)
        );
    }

    /**
     * 充值是否成功
     */
    isRechargeSuccess(): Observable<boolean> {
        return this.store.select(fromRoot.selectServerSendRechargeMessage).pipe(
            map(res => !!res && !!res.orderId)
        );
    }

    /**
     * 获取需要租用的策略
     * @param idObs 目标id
     */
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

    //  =======================================================Short cart method==================================================

    /**
     * 解析策略的租用价格
     */
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

    //  =======================================================Local state modify==================================================

    /**
     * @ignore
     */
    resetRecharge(): void {
        this.store.dispatch(new ResetRechargeAction());
    }

    //  =======================================================Error Handle=======================================================

    /**
     * @ignore
     */
    handlePaymentsArgsError(): Subscription {
        return this.error.handleResponseError(this.getPaymentArgsResponse());
    }

    /**
     * @ignore
     */
    handlePayOrdersError(): Subscription {
        return this.error.handleResponseError(this.getPayOrdersResponse());
    }
}
