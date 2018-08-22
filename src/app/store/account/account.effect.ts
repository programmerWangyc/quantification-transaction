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
        .pipe(tap(this.message('MODIFY_PASSWORD_SUCCESS', 'MODIFY_PASSWORD_FAIL')));

    @Effect()
    changeNickname$: Observable<ResponseAction> = this.getResponseAction(accountAction.CHANGE_NICKNAME, accountAction.ResponseActions, isRequestFail)
        .pipe(tap(this.message('MODIFY_NICKNAME_SUCCESS', 'MODIFY_NICKNAME_FAIL')));

    @Effect()
    googleAuthKey$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_GOOGLE_AUTH_KEY, accountAction.ResponseActions);

    @Effect()
    unbindSNS$: Observable<ResponseAction> = this.getResponseAction(accountAction.UNBIND_SNS, accountAction.ResponseActions)
        .pipe(tap(this.message('UNBIND_SUCCESS', 'UNBIND_FAIL')));

    @Effect()
    bindGoogleAuth$: Observable<ResponseAction> = this.getResponseAction(accountAction.BIND_GOOGLE_AUTH, accountAction.ResponseActions);

    @Effect()
    getAccount$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_ACCOUNT, accountAction.ResponseActions);

    @Effect()
    shadowMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.GET_SHADOW_MEMBER, accountAction.ResponseActions);

    @Effect()
    addShadowMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.ADD_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.message('CREATE_SUBACCOUNT_SUCCESS', 'CREATE_SUBACCOUNT_FAIL'))
    );

    @Effect()
    updateShadowMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.UPDATE_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.message('UPDATE_SUBACCOUNT_SUCCESS', 'UPDATE_SUBACCOUNT_FAIL'))
    );

    @Effect()
    lockMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.LOCK_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.message('OPERATE_SUCCESS', 'OPERATE_FAIL'))
    );

    @Effect()
    deleteMember$: Observable<ResponseAction> = this.getResponseAction(accountAction.DELETE_SHADOW_MEMBER, accountAction.ResponseActions, isRequestFail).pipe(
        tap(this.message('DELETE_SUBACCOUNT_SUCCESS', 'DELETE_SUBACCOUNT_FAIL'))
    );

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        private tip: TipService,
    ) {
        super(ws, actions$);
    }

    /**
     * @ignore
     */
    private message(successMsg: string, failMsg: string): (action: accountAction.ApiActions) => void {
        return (action: accountAction.ApiActions) => {
            if (!!action.payload.result) {
                this.tip.messageSuccess(successMsg);
            } else {
                this.tip.messageError(failMsg);
            }
        };
    }
}

type ApiRes = ChangeNickNameResponse | SaveShadowMemberResponse | ChangePasswordResponse | DeleteShadowMemberResponse | LockShadowMemberResponse;

/**
 * @ignore
 */
function isRequestFail(res: ApiRes): boolean {
    return !!res.error || !res.result;
}
