import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as actions from './comment.action';
import { SubmitCommentResponse } from '../../interfaces/response.interface';

@Injectable()
export class CommentEffect extends BaseEffect {

    @Effect()
    commentList$: Observable<ResponseAction> = this.getResponseAction(actions.GET_COMMENT_LIST, actions.ResponseActions);

    @Effect()
    addComment$: Observable<ResponseAction> = this.getResponseAction(actions.ADD_COMMENT, actions.ResponseActions).pipe(
        tap(this.tip.messageByResponse('COMMIT_SUCCESS', 'COMMIT_FAIL_TRY_AGAIN_LATER'))
    );

    @Effect()
    deleteComment$: Observable<ResponseAction> = this.getResponseAction(actions.DELETE_COMMENT, actions.ResponseActions, isDeleteFail).pipe(
        tap(this.tip.messageByResponse('COMMENT_DELETE_SUCCESS', 'CAN_NOT_DELETE_TOPIC'))
    );

    @Effect()
    updateComment$: Observable<ResponseAction> = this.getResponseAction(actions.UPDATE_COMMENT, actions.ResponseActions).pipe(
        tap(this.tip.messageByResponse('COMMENT_UPDATE_SUCCESS', 'REPLY_FAIL_TIP'))
    );

    @Effect()
    qiniu$: Observable<ResponseAction> = this.getResponseAction(actions.GET_QINIU_TOKEN, actions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
    ) {
        super(ws, actions$);
    }
}

/**
 * @ignore
 */
export function isDeleteFail(res: SubmitCommentResponse): boolean {
    return !!res.error || !res.result;
}
