import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as actions from './comment.action';

@Injectable()
export class CommentEffect extends BaseEffect {

    @Effect()
    commentList$: Observable<ResponseAction> = this.getResponseAction(actions.GET_COMMENT_LIST, actions.ResponseActions);

    @Effect()
    submitComment$: Observable<ResponseAction> = this.getResponseAction(actions.SUBMIT_COMMENT, actions.ResponseActions);

    @Effect()
    qiniu$: Observable<ResponseAction> = this.getResponseAction(actions.SUBMIT_COMMENT, actions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }
}
