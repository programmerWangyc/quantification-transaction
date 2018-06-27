import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { ResponseAction } from '../base.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as btNode from './bt-node.action';

@Injectable()
export class BtNodeEffect extends BaseEffect {

    @Effect()
    nodeList$: Observable<ResponseAction> = this.getResponseAction(btNode.GET_NODE_LIST, btNode.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}