import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import { ResponseActions as watchDog, SET_ROBOT_WATCH_DOG } from './watch-dog.action';

@Injectable()
export class WatchDogEffect extends BaseEffect {

    @Effect()
    watchDog$: Observable<ResponseAction> = this.getResponseAction(SET_ROBOT_WATCH_DOG, watchDog).pipe(
        tap(this.tip.messageByResponse('OPERATE_SUCCESS', 'OPERATE_FAIL'))
    );

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }
}
