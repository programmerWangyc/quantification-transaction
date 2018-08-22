import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { omit } from 'lodash';
import { empty as observableEmpty, Observable } from 'rxjs';
import { map, mergeMap, filter } from 'rxjs/operators';

import { LocalStorageKey } from '../../app.config';
import { PublicResponse } from '../../interfaces/response.interface';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as pub from './public.action';

@Injectable()
export class PublicEffect extends BaseEffect {

    /**
     * 简单的把事件流从公共信息中去除，保证是dispatch 的是 PublicResponse;
     * 各业务reducer自行订阅所需事件，公共reducer不提供。
     */
    @Effect()
    pubInfo$: Observable<ResponseAction> = this.ws.messages.pipe(
        filter(data => !data.event),
        map(data => {
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
