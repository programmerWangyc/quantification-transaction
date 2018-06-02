import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { DeleteStrategyResponse } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { ResponseAction } from '../base.action';
import * as btNodeActions from '../bt-node/bt-node.action';
import * as platformActions from '../platform/platform.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as strategyActions from './strategy.action';


@Injectable()
export class StrategyEffect extends BaseEffect {

    @Effect()
    strategyList$: Observable<ResponseAction> = this.getMultiResponseActions(
        this.actions$.ofType(strategyActions.GET_STRATEGY_LIST).zip(...this.getOtherObs()),
        { ...strategyActions.ResponseActions, ...btNodeActions.ResponseActions, ...platformActions.ResponseActions }
    );

    @Effect()
    share$: Observable<ResponseAction> = this.getResponseAction(strategyActions.SHARE_STRATEGY, strategyActions.ResponseActions);

    @Effect()
    genKey$: Observable<ResponseAction> = this.getResponseAction(strategyActions.GEN_KEY, strategyActions.ResponseActions);

    @Effect()
    verifyKey$: Observable<ResponseAction> = this.getResponseAction(strategyActions.VERIFY_KEY, strategyActions.ResponseActions)
        .do((action: strategyActions.VerifyKeySuccessAction | strategyActions.VerifyKeyFailAction) => action.payload.result && this.tip.messageError('VERIFY_KEY_SUCCESS'));

    @Effect()
    delete$: Observable<ResponseAction> = this.getResponseAction(strategyActions.DELETE_STRATEGY, strategyActions.ResponseActions, isDeleteFail)
        .do((action: strategyActions.DeleteStrategyFailAction | strategyActions.DeleteStrategySuccessAction) => isDeleteFail(action.payload) && this.tip.showTip('DELETE_ROBOT_RELATED_WITH_STRATEGY'));

    @Effect()
    opToke$: Observable<ResponseAction> = this.getResponseAction(strategyActions.GET_STRATEGY_TOKEN, strategyActions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }

    getOtherObs(): Observable<Action>[] {
        return [
            this.actions$.ofType(btNodeActions.GET_NODE_LIST),
            this.actions$.ofType(platformActions.GET_PLATFORM_LIST)
        ];
    }
}

function isDeleteFail(res: DeleteStrategyResponse): boolean {
    return !!res.error || res.result === -1;
}
