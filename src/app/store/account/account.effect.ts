import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators/';

import {
    ChangeNickNameResponse, ChangePasswordResponse, DeleteShadowMemberResponse, LockShadowMemberResponse,
    SaveShadowMemberResponse
} from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import * as accountAction from './account.action';

@Injectable()
export class AccountEffect extends BaseEffect {

    @Effect()
    changePassword$: Observable<ResponseAction> = this.getResponseAction(accountAction.CHANGE_PASSWORD, accountAction.ResponseActions, isRequestFail)
        .pipe(tap(this.tip.messageByResponse('MODIFY_PASSWORD_SUCCESS', 'MODIFY_PASSWORD_FAIL')));

    @Effect()
    changeNickname$: Observable<ResponseAction> = this.getResponseAction(accountAction.CHANGE_NICKNAME, accountAction.ResponseActions, isRequestFail)
        .pipe(tap(this.tip.messageByResponse('MODIFY_NICKNAME_SUCCESS', 'MODIFY_NICKNAME_FAIL')));

    @Effect()
    googleAuthKey$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_GOOGLE_AUTH_KEY, accountAction.ResponseActions);

    @Effect()
    unbindSNS$: Observable<ResponseAction> = this.getResponseAction(accountAction.UNBIND_SNS, accountAction.ResponseActions)
        .pipe(tap(this.tip.messageByResponse('UNBIND_SUCCESS', 'UNBIND_FAIL')));

    @Effect()
    bindGoogleAuth$: Observable<ResponseAction> = this.getResponseAction(accountAction.BIND_GOOGLE_AUTH, accountAction.ResponseActions);

    @Effect()
    getAccount$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_ACCOUNT, accountAction.ResponseActions);

    @Effect()
    shadowMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_SHADOW_MEMBER, accountAction.ResponseActions);

    @Effect()
    addShadowMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.ADD_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.tip.messageByResponse('CREATE_SUBACCOUNT_SUCCESS', 'CREATE_SUBACCOUNT_FAIL'))
    );

    @Effect()
    updateShadowMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.UPDATE_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.tip.messageByResponse('UPDATE_SUBACCOUNT_SUCCESS', 'UPDATE_SUBACCOUNT_FAIL'))
    );

    @Effect()
    lockMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.LOCK_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.tip.messageByResponse('OPERATE_SUCCESS', 'OPERATE_FAIL'))
    );

    @Effect()
    deleteMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.DELETE_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.tip.messageByResponse('DELETE_SUBACCOUNT_SUCCESS', 'DELETE_SUBACCOUNT_FAIL'))
    );

    @Effect()
    apiKeyList$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_API_KEY_LIST, accountAction.ResponseActions);

    @Effect()
    createApiKey$: Observable<ResponseAction> = this.getResponseAction(accountAction.CREATE_API_KEY, accountAction.ResponseActions).pipe(
        tap(this.tip.messageByResponse('CREATE_API_KEY_SUCCESS', 'CREATE_API_KEY_FAIL'))
    );

    @Effect()
    lockApiKe$: Observable<ResponseAction> = this.getResponseAction(accountAction.LOCK_API_KEY, accountAction.ResponseActions).pipe(
        tap(this.tip.messageByResponse('OPERATE_SUCCESS', 'OPERATE_FAIL'))
    );

    @Effect()
    deleteApiKey$: Observable<ResponseAction> = this.getResponseAction(accountAction.DELETE_API_KEY, accountAction.ResponseActions).pipe(
        tap(this.tip.messageByResponse('DELETE_API_KEY_SUCCESS', 'DELETE_API_KEY_FAIL'))
    );

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        private tip: TipService,
    ) {
        super(ws, actions$);
    }
}

type ApiRes = ChangeNickNameResponse | SaveShadowMemberResponse | ChangePasswordResponse | DeleteShadowMemberResponse | LockShadowMemberResponse;

/**
 * @ignore
 */
function isRequestFail(res: ApiRes): boolean {
    return !!res.error || !res.result;
}
