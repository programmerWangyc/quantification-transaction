import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import { GET_EXCHANGE_LIST, ResponseActions as exchange } from './exchange.action';

@Injectable()
export class ExchangeEffect extends BaseEffect {

    @Effect()
    exchangeList$: Observable<ResponseAction> = this.getResponseAction(GET_EXCHANGE_LIST, exchange);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}
