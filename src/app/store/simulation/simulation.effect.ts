import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as simulationActions from './simulation.action';

@Injectable()
export class SimulationEffect extends BaseEffect {

    @Effect()
    sandboxToke$: Observable<ResponseAction> = this.getResponseAction(simulationActions.GET_SANDBOX_TOKEN, simulationActions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}
