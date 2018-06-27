import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { filter, map, tap } from 'rxjs/operators';

import { ServerSendEventType, ServerSendPaymentMessage } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { ResponseAction } from '../base.action';
import { AppState, selectPaymentArgRequestParams } from '../index.reducer';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as chargeActions from './charge.action';

@Injectable()
export class ChargeEffect extends BaseEffect {

    @Effect()
    paymentArg$: Observable<ResponseAction> = this.getResponseAction(chargeActions.GET_PAYMENT_ARG, chargeActions);

    @Effect()
    payOrder$: Observable<ResponseAction> = this.getResponseAction(chargeActions.GET_PAY_ORDERS, chargeActions);

    @Effect()
    serveSendPaymentSuccess$: Observable<ResponseAction> = this.toggleResponsiveServerSendEvent()
        //TODO: 此处可能还少一个条件：这个payment必须是充值？
        .pipe(
            switchMap(state => this.ws.messages
                .pipe(
                    filter(msg => msg.event && (msg.event === ServerSendEventType.PAYMENT)),
                    tap(_ => this.tip.showTip('RECHARGE_SUCCESS')),
                    map(msg => new chargeActions.ReceiveServerSendPaymentEventAction(<ServerSendPaymentMessage>msg.result))
                )
            )
        );

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
        public store: Store<AppState>,
    ) {
        super(ws, actions$);
    }

    toggleResponsiveServerSendEvent(): Observable<boolean> {
        return this.store.select(selectPaymentArgRequestParams)
            .pipe(
                map(arg => !!arg)
            );
    }
}
