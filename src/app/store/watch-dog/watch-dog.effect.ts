import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { ResponseAction } from '../base.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import { ResponseActions as watchDog, SET_ROBOT_WATCH_DOG } from './watch-dog.action';

@Injectable()
export class WatchDogEffect extends BaseEffect {

    @Effect()
    watchDog$: Observable<ResponseAction> = this.getResponseAction(SET_ROBOT_WATCH_DOG, watchDog);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}