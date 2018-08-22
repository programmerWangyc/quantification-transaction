import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as messageActions from './message.action';

@Injectable()
export class MessageEffect extends BaseEffect {

    @Effect()
    message$: Observable<ResponseAction> = this.getResponseAction(messageActions.GET_MESSAGE, messageActions.ResponseActions);

    @Effect()
    deleteMessage$: Observable<ResponseAction> = this.getResponseAction(messageActions.DELETE_MESSAGE, messageActions.ResponseActions);

    @Effect()
    apmMessage$: Observable<ResponseAction> = this.getResponseAction(messageActions.GET_APM_MESSAGE, messageActions.ResponseActions);

    @Effect()
    deleteAPMMessage$: Observable<ResponseAction> = this.getResponseAction(messageActions.DELETE_APM_MESSAGE, messageActions.ResponseActions);

    @Effect()
    bbsNotify$: Observable<ResponseAction> = this.getResponseAction(messageActions.GET_BBS_NOTIFY, messageActions.ResponseActions);

    @Effect()
    deleteBBSNotify$: Observable<ResponseAction> = this.getResponseAction(messageActions.DELETE_BBS_NOTIFY, messageActions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}
