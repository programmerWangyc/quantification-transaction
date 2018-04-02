import 'rxjs/add/observable/empty';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { omit } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { LocalStorageKey } from './../../interfaces/constant.interface';
import { PublicResponse, ResponseAction } from './../../interfaces/response.interface';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as pub from './public.action';


@Injectable()
export class PublicEffect extends BaseEffect {
    @Effect()
    pubInfo$: Observable<ResponseAction>;

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
    settings$: Observable<ResponseAction> = this.actions$
        .ofType(pub.GET_SETTINGS)
        .mergeMap((action: pub.GetSettingsRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(pub.GET_SETTINGS))
            .mergeMap(body => this.getSplitAction(body, pub))
            .catch(error => Observable.of(error))
        );

    constructor(
        private ws: WebsocketService,
        private actions$: Actions
    ) {
        super();
        this.pubInfo$ = ws.messages.map(data => {
            const info = <PublicResponse>omit(data, 'result');

            return new pub.SetPublicInformationAction(info);
        });
    }
}