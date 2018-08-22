import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { omit } from 'lodash';
import { empty as observableEmpty, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { LocalStorageKey } from '../../app.config';
import { PublicResponse } from '../../interfaces/response.interface';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as pub from './public.action';

@Injectable()
export class PublicEffect extends BaseEffect {
    @Effect()
    pubInfo$: Observable<ResponseAction> = this.ws.messages.pipe(
        map(data => {
            /**
             * !FIXME 机器人运行时会不停止的收到运行消息，需要把它分流到业务reducer中。
             */
            const info = <PublicResponse>omit(data, 'result');

            return new pub.SetPublicInformationAction(info);
        })
    );

    @Effect()
    referrer$: Observable<ResponseAction> = this.actions$
        .ofType(pub.SET_REFERRER).pipe(
            mergeMap((action: pub.SetReferrerAction) => {
                const { refUrl, refUser } = action.payload;

                localStorage.setItem(LocalStorageKey.refUrl, refUrl);

                localStorage.setItem(LocalStorageKey.refUser, refUser);

                return observableEmpty();
            })
        );

    @Effect()
    sett$ = this.getResponseAction(pub.GET_SETTINGS, pub.ResponseActions);

    @Effect()
    logout$: Observable<ResponseAction> = this.getResponseAction(pub.LOGOUT, pub.ResponseActions);

    constructor(
        public ws: WebsocketService,
        public actions$: Actions
    ) {
        super(ws, actions$);
    }
}
