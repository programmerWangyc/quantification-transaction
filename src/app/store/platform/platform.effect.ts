import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as platform from './platform.action';
import { TipService } from '../../providers/tip.service';
import { SavePlatformResponse } from '../../interfaces/response.interface';

/**
 * @ignore
 */
@Injectable()
export class PlatformEffect extends BaseEffect {

    @Effect()
    platformList$: Observable<ResponseAction> = this.getResponseAction(platform.GET_PLATFORM_LIST, platform.ResponseActions);

    @Effect()
    deletePlatform$: Observable<ResponseAction> = this.getResponseAction(platform.DELETE_PLATFORM, platform.ResponseActions).pipe(
        tap(this.tip.messageByResponse('EXCHANGE_DELETE_SUCCESS', 'EXCHANGE_DELETE_FAIL'))
    );

    @Effect()
    detail$: Observable<ResponseAction> = this.getResponseAction(platform.GET_PLATFORM_DETAIL, platform.ResponseActions);

    @Effect()
    update$: Observable<ResponseAction> = this.getResponseAction(platform.SAVE_PLATFORM, platform.ResponseActions, isSavePlatformFail);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        private tip: TipService,
    ) {
        super(ws, actions$);
    }
}

/**
 * @ignore
 */
export function isSavePlatformFail(response: SavePlatformResponse): boolean {
    return !response.result || !!response.error;
}
