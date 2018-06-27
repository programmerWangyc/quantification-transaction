import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { ResponseAction } from '../base.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import { ResponseActions as watchDog, SET_ROBOT_WATCH_DOG, SetRobotWDFailAction, SetRobotWDSuccessAction } from './watch-dog.action';
import { TipService } from '../../providers/tip.service';

@Injectable()
export class WatchDogEffect extends BaseEffect {

    @Effect()
    watchDog$: Observable<ResponseAction> = this.getResponseAction(SET_ROBOT_WATCH_DOG, watchDog)
        .do((action: SetRobotWDFailAction | SetRobotWDSuccessAction) => this.tip.showTip(action.payload.result ? 'OPERATE_SUCCESS' : 'OPERATE_FAIL'));

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }
}
