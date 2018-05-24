import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

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

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
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
