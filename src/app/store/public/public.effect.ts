import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { omit } from 'lodash';
import { empty as observableEmpty, Observable } from 'rxjs';
import { map, mergeMap, filter, tap } from 'rxjs/operators';

import { LocalStorageKey } from '../../app.config';
import { PublicResponse, ChangeAlertThresholdSettingResponse } from '../../interfaces/response.interface';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as pub from './public.action';
import { TipService } from '../../providers/tip.service';
import { GET_PUBLIC_STRATEGY_DETAIL, ResponseActions as strategyResponseActions, GET_STRATEGY_LIST_BY_NAME } from '../strategy/strategy.action';
import { GET_PUBLIC_ROBOT_LIST, ResponseActions as robotResponseActions } from '../robot/robot.action';

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

    @Effect()
    changeAlertThreshold$: Observable<ResponseAction> = this.getResponseAction(pub.CHANGE_ALERT_THRESHOLD_SETTING, pub.ResponseActions, isRequestFail).pipe(
        tap(this.tip.messageByResponse('SET_ALERT_THRESHOLD_SUCCESS', 'SET_ALERT_THRESHOLD_FAIL'))
    );

    @Effect()
    publicDetail$: Observable<ResponseAction> = this.getResponseAction(GET_PUBLIC_STRATEGY_DETAIL, strategyResponseActions);

    @Effect()
    publicRobotList$: Observable<ResponseAction> = this.getResponseAction(GET_PUBLIC_ROBOT_LIST, robotResponseActions);

    @Effect()
    strategyListByName$: Observable<ResponseAction> = this.getResponseAction(GET_STRATEGY_LIST_BY_NAME, strategyResponseActions);

    @Effect()
    accountSummary$: Observable<ResponseAction> = this.getResponseAction(pub.GET_ACCOUNT_SUMMARY, pub.ResponseActions);

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
        private tip: TipService,
    ) {
        super(ws, actions$);
    }
}

export function isRequestFail(res: ChangeAlertThresholdSettingResponse): boolean {
    return !!res.error || !res.result;
}
