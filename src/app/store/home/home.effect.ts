import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { zip } from 'rxjs/operators';

import { ResponseAction } from '../base.action';
import { GET_EXCHANGE_LIST, ResponseActions as exchange } from '../exchange/exchange.action';
import { GET_SETTINGS, ResponseActions as pub } from '../public/public.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';


@Injectable()
export class HomeEffect extends BaseEffect {

    @Effect()
    homeInfo$: Observable<ResponseAction> = this.getMultiResponseActions(
        this.actions$.ofType(GET_SETTINGS).pipe(
            zip(this.actions$.ofType(GET_EXCHANGE_LIST))),
        { ...pub, ...exchange }
    );

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) {
        super(ws, actions$);
    }
}
