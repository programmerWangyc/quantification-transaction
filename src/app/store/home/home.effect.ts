import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable, zip } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import { GET_EXCHANGE_LIST, ResponseActions as exchange } from '../exchange/exchange.action';
import { GET_SETTINGS, ResponseActions as pub } from '../public/public.action';

@Injectable()
export class HomeEffect extends BaseEffect {

    @Effect()
    homeInfo$: Observable<ResponseAction> = this.getMultiResponseActions(
        zip(
            this.actions$.ofType(GET_SETTINGS),
            this.actions$.ofType(GET_EXCHANGE_LIST)
        ),
        { ...pub, ...exchange }
    );

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) {
        super(ws, actions$);
    }
}
