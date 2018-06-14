import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

import { TipService } from '../../providers/tip.service';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';

@Injectable()
export class BacktestEffect extends BaseEffect {

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }
}
