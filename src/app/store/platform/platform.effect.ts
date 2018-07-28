import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as platform from './platform.action';
import { TipService } from '../../providers/tip.service';

/**
 * @ignore
 */
@Injectable()
export class PlatformEffect extends BaseEffect {

    @Effect()
    platformList$: Observable<ResponseAction> = this.getResponseAction(platform.GET_PLATFORM_LIST, platform.ResponseActions);

    @Effect()
    deletePlatform$: Observable<ResponseAction> = this.getResponseAction(platform.DELETE_PLATFORM, platform.ResponseActions).pipe(
        tap((action: platform.DeletePlatformFailAction | platform.DeletePlatformSuccessAction) => action.payload.result && this.tip.messageSuccess('EXCHANGE_DELETE_SUCCESS'))
    );

    @Effect()
    detail$: Observable<ResponseAction> = this.privateGetResponseAction(platform.GET_PLATFORM_DETAIL);

    @Effect()
    update$: Observable<ResponseAction> = this.privateGetResponseAction(platform.UPDATE_PLATFORM);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        private tip: TipService,
    ) {
        super(ws, actions$);
    }

    private privateGetResponseAction(action): Observable<ResponseAction> {
        return this.getResponseAction(action, platform.ResponseActions);
    }
}
