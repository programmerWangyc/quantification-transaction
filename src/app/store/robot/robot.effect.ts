import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { ResponseAction } from '../base.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import { GET_ROBOT_LIST, ResponseActions as robot } from './robot.action';

@Injectable()
export class RobotEffect extends BaseEffect {

    @Effect()
    robotList$: Observable<ResponseAction> = this.getResponseAction(GET_ROBOT_LIST, robot);

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) { 
        super(ws, actions$);
    }
}