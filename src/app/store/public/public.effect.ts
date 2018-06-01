import 'rxjs/add/observable/empty';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { omit } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { LocalStorageKey } from '../../app.config';
import { ResponseAction } from '../base.action';
import { PublicResponse } from './../../interfaces/response.interface';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as pub from './public.action';

@Injectable()
export class PublicEffect extends BaseEffect {
    @Effect()
    pubInfo$: Observable<ResponseAction> = this.ws.messages.map(data => {
        const info = <PublicResponse>omit(data, 'result');

        return new pub.SetPublicInformationAction(info);
    });

    @Effect()
    referrer$: Observable<any> = this.actions$
        .ofType(pub.SET_REFERRER)
        .mergeMap((action: pub.SetReferrerAction) => {
            const { refUrl, refUser } = action.payload;

            localStorage.setItem(LocalStorageKey.refUrl, refUrl);

            localStorage.setItem(LocalStorageKey.refUser, refUser);

            return Observable.empty();
        });

    @Effect()
    sett$ = this.getResponseAction(pub.GET_SETTINGS, pub);

    constructor(
        public ws: WebsocketService,
        public actions$: Actions
    ) {
        super(ws, actions$);
    }
}
