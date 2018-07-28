import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as btNode from './bt-node.action';
import { DeleteNodeResponse } from '../../interfaces/response.interface';
import { tap } from 'rxjs/operators';
import { TipService } from '../../providers/tip.service';

@Injectable()
export class BtNodeEffect extends BaseEffect {

    @Effect()
    nodeList$: Observable<ResponseAction> = this.getResponseAction(btNode.GET_NODE_LIST, btNode.ResponseActions);

    @Effect()
    delete$: Observable<ResponseAction> = this.getResponseAction(btNode.DELETE_NODE, btNode.ResponseActions, isDeleteNodeFail).pipe(
        tap((action: btNode.DeleteNodeSuccessAction | btNode.DeleteNodeFailAction) => action.payload.result === -1 && this.tip.messageError('SOME_ROBOT_IS_RUNNING_AT_AGENT'))
    );

    @Effect()
    nodeHash$: Observable<ResponseAction> = this.getResponseAction(btNode.GET_NODE_HASH, btNode.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        private tip: TipService,
    ) {
        super(ws, actions$);
    }
}

/**
 * 删除托管者是否失败
 */
export function isDeleteNodeFail(res: DeleteNodeResponse): boolean {
    return res.result === -1;
}
