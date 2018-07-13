import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as platform from './platform.action';

@Injectable()
export class PlatformEffect extends BaseEffect {

    @Effect()
    platformList$: Observable<ResponseAction> = this.getResponseAction(platform.GET_PLATFORM_LIST, platform.ResponseActions);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
    ) {
        super(ws, actions$);
    }
}