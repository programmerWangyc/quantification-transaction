import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as bbsActions from './bbs.action';

@Injectable()
export class BBSEffect extends BaseEffect {

    @Effect()
    planeList$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_PLANE_LIST, bbsActions.ResponseActions);

    @Effect()
    nodeList$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_NODE_LIST, bbsActions.ResponseActions);

    @Effect()
    topicListBySlug$: Observable<ResponseAction> = this.getResponseAction(bbsActions.GET_BBS_TOPIC_LIST_BY_SLUG, bbsActions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}
