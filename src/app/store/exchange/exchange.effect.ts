import { Observable } from 'rxjs/Observable';
import { WebsocketService } from './../../providers/websocket.service';
import { Actions, Effect } from '@ngrx/effects';
import { BaseEffect } from './../base.effect';
import { Injectable } from '@angular/core';
import { ResponseActions as exchange, GET_EXCHANGE_LIST} from './exchange.action';

@Injectable()
export class ExchangeEffect extends BaseEffect {

    @Effect()
    exchangeList$ = this.getResponseAction(GET_EXCHANGE_LIST, exchange);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}