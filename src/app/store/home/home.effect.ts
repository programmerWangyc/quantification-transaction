import { WsRequest } from './../../interfaces/request.interface';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { ResponseActions as pub, GET_SETTINGS} from '../public/public.action'; 
import { ResponseActions as exchange, GET_EXCHANGE_LIST} from '../exchange/exchange.action';
import { ApiAction, ResponseAction } from '../base.action';
import { Action } from '@ngrx/store';

@Injectable()
export class HomeEffect extends BaseEffect {

    @Effect()
    homeInfo$: Observable<ResponseAction> = this.getMultiResponseActions(
        this.actions$.ofType(GET_SETTINGS)
            .zip(this.actions$.ofType(GET_EXCHANGE_LIST)),
        { ...pub, ...exchange }
    );

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) {
        super(ws, actions$);
    }
}