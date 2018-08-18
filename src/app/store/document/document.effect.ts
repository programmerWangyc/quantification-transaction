import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as documentActions from './document.action';

@Injectable()
export class DocumentEffect extends BaseEffect {

    @Effect()
    document$: Observable<ResponseAction> = this.getResponseAction(documentActions.GET_DOCUMENT, documentActions.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}
