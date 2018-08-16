import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as bbsActions from './bbs.action';
import { AddBBSTopicResponse } from '../../interfaces/response.interface';

@Injectable()
export class BBSEffect extends BaseEffect {

    @Effect()
    planeList$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_PLANE_LIST, bbsActions.ResponseActions);

    @Effect()
    nodeList$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_NODE_LIST, bbsActions.ResponseActions);

    @Effect()
    topicListBySlug$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_TOPIC_LIST_BY_SLUG, bbsActions.ResponseActions);

    @Effect()
    topicById$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_TOPIC_BY_ID, bbsActions.ResponseActions);

    @Effect()
    add$: Observable<ResponseAction> = this.getResponseAction(bbsActions.ADD_BBS_TOPIC, bbsActions.ResponseActions, isAddBBSTopicFail);

    @Effect()
    qiniu$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_QINIU_TOKEN, bbsActions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}

/**
 * @ignore
 */
export function isAddBBSTopicFail(res: AddBBSTopicResponse): boolean {
    return !!res.error || isNaN(res.result);
}
