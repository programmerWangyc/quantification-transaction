import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { isString } from 'lodash';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

import { DeleteStrategyResponse } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as strategyActions from './strategy.action';


@Injectable()
export class StrategyEffect extends BaseEffect {

    @Effect()
    strategyList$: Observable<ResponseAction> = this.getResponseAction(strategyActions.GET_STRATEGY_LIST, strategyActions.ResponseActions);

    @Effect()
    share$: Observable<ResponseAction> = this.getResponseAction(strategyActions.SHARE_STRATEGY, strategyActions.ResponseActions);

    @Effect()
    genKey$: Observable<ResponseAction> = this.getResponseAction(strategyActions.GEN_KEY, strategyActions.ResponseActions);

    @Effect()
    verifyKey$: Observable<ResponseAction> = this.getResponseAction(strategyActions.VERIFY_KEY, strategyActions.ResponseActions)
        .pipe(
            tap((action: strategyActions.VerifyKeySuccessAction | strategyActions.VerifyKeyFailAction) => action.payload.result && this.tip.messageError('VERIFY_KEY_SUCCESS'))
        );

    @Effect()
    delete$: Observable<ResponseAction> = this.getResponseAction(strategyActions.DELETE_STRATEGY, strategyActions.ResponseActions, isDeleteFail)
        .pipe(
            tap((action: strategyActions.DeleteStrategyFailAction | strategyActions.DeleteStrategySuccessAction) => isDeleteFail(action.payload) && this.tip.showTip('DELETE_ROBOT_RELATED_WITH_STRATEGY'))
        );

    @Effect()
    opToke$: Observable<ResponseAction> = this.getResponseAction(strategyActions.GET_STRATEGY_TOKEN, strategyActions.ResponseActions);

    @Effect()
    strategyDetail$: Observable<ResponseAction> = this.getResponseAction(strategyActions.GET_STRATEGY_DETAIL, strategyActions.ResponseActions);

    @Effect()
    saveStrategy$: Observable<ResponseAction> = this.getResponseAction(strategyActions.SAVE_STRATEGY, strategyActions.ResponseActions).pipe(
        tap((action: strategyActions.SaveStrategyFailAction | strategyActions.SaveStrategySuccessAction) => {
            const result = action.payload.result;

            if (!result) {
                this.tip.messageError('STRATEGY_NAME_DUPLICATE_ERROR');
            } else {
                const message = isString(result) ? 'SAVE_STRATEGY_SUCCESS_WITH_UPDATED_KEY' : 'SAVE_SUCCESS';

                this.tip.messageSuccess(message);
            }
        })
    );

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }
}

function isDeleteFail(res: DeleteStrategyResponse): boolean {
    return !!res.error || res.result === -1;
}
