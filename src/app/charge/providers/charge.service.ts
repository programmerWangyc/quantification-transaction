import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of as observableOf, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import {
    GetPaymentArgResponse,
    GetPayOrdersResponse,
    PayOrder,
    ServerSendPaymentMessage,
} from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { ResetRechargeAction } from '../../store/charge/charge.action';
import {
    AppState,
    selectPaymentArgRequestParams,
    selectPaymentArgResponse,
    selectPayOrdersResponse,
    selectServerSendRechargeMessage,
} from '../../store/index.reducer';
import { PaymentMethod } from '../charge.config';
import { getChargePrice } from '../pipes/charge.pipe';


export interface RechargeFormModal {
    payMethod: number;
    chargeAmount: number;
}

@Injectable()
export class ChargeService extends BaseService {

    private renderer2: Renderer2;

    alipayAddress = 'https://mapi.alipay.com/gateway.do'

    constructor(
        private store: Store<AppState>,
        private error: ErrorService,
        private process: ProcessService,
        public rendererFactory: RendererFactory2,
    ) {
        super();
        this.renderer2 = this.rendererFactory.createRenderer(null, null);
    }

    //  =======================================================Server request=======================================================

    launchPaymentArg(data: Observable<RechargeFormModal>, strategyId: Observable<number> = observableOf(0)): Subscription {
        return this.process.processPaymentArg(
            data
                .pipe(
                    withLatestFrom(
                        strategyId,
                        ({ payMethod, chargeAmount }, strategyId) => ({ payMethod, chargeAmount, strategyId })
                    )
                )
        );
    }

    launchPayOrders(data: Observable<any>): Subscription {
        return this.process.processPayOrders(data);
    }

    //  =======================================================Date Acquisition=======================================================

    // payment
    private getPaymentArgsResponse(): Observable<GetPaymentArgResponse> {
        return this.store.pipe(select(selectPaymentArgResponse))
            .pipe(
                filter(this.isTruth)
            );
    }

    private goToPaymentPage(payMethod: number): Observable<GetPaymentArgResponse> {
        return this.getPaymentArgsResponse()
            .pipe(
                withLatestFrom(this.store.select(selectPaymentArgRequestParams)),
                filter(([res, req]) => !!req && (req.payMethod === payMethod)),
                map(([res, _]) => res)
            );
    }

    goToAlipayPage(): Subscription {
        return this.goToPaymentPage(PaymentMethod.ALIPAY)
            .pipe(
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
                    })

                    this.renderer2.appendChild(document.body, form);

                    form.submit();

                    return form;
                })
            )
            .subscribe(form => this.renderer2.removeChild(document.body, form));
    }

    goToPayPal(): Subscription {
        return this.goToPaymentPage(PaymentMethod.PAY_PAL)
            .subscribe(res => location.href = res.result.code_url);
    }

    getWechartQrCode(): Observable<string> {
        return this.goToPaymentPage(PaymentMethod.WECHART)
            .pipe(
                map(res => res.result.code_url),
                distinctUntilChanged()
            );
    }

    // pay orders
    private getPayOrdersResponse(): Observable<GetPayOrdersResponse> {
        return this.store.select(selectPayOrdersResponse)
            .pipe(
                filter(this.isTruth)
            );
    }

    getHistoryOrders(): Observable<PayOrder[]> {
        return this.getPayOrdersResponse()
            .pipe(
                map(res => res.result.items)
            );
    }

    getSpecificHistoryOrders(flag: string): Observable<PayOrder[]> {
        const predicate = this.isSpecificOrder(flag);

        return this.getHistoryOrders()
            .pipe(
                map(orders => orders.filter(predicate))
            );
    }

    isSpecificOrder(flag: string): (order: PayOrder) => boolean {
        return order => order.order_guid.indexOf(flag) !== -1;
    }

    getHistoryOrderTotalAmount(data: Observable<PayOrder[]>): Observable<number> {
        return data
            .pipe(
                map(orders => orders.reduce((acc, cur) => acc + getChargePrice(cur.order_guid), 0))
            );
    }

    // server send message
    private getServerSendRechargeMessage(): Observable<ServerSendPaymentMessage> {
        return this.store.select(selectServerSendRechargeMessage)
            .pipe(
                this.filterTruth()
            );
    }

    isRechargeSuccess(): Observable<boolean> {
        return this.getServerSendRechargeMessage()
            .pipe(
                mapTo(true)
            );
    }

    //  =======================================================Short cart method==================================================

    //  =======================================================Local state modify==================================================

    resetRecharge(): void {
        this.store.dispatch(new ResetRechargeAction());
    }

    //  =======================================================Error Handle=======================================================

    handlePaymentsArgsError(): Subscription {
        return this.error.handleResponseError(this.getPaymentArgsResponse());
    }

    handlePayOrdersError(): Subscription {
        return this.error.handleResponseError(this.getPayOrdersResponse());
    }
}
