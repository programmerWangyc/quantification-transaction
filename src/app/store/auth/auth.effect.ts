import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/zip';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import { LoginResponse, SignupResponse } from '../../interfaces/response.interface';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import { ResetPasswordResponse, SetPasswordResponse } from './../../interfaces/response.interface';
import { LOGIN, ResponseActions as loginAction } from './login.action';
import { ResponseActions as setAction, SET_PASSWORD } from './password.action';
import { RESET_PASSWORD, ResponseActions as resetAction } from './reset.action';
import { ResponseActions as signupAction, SIGNUP } from './signup.action';
import { ResponseActions as verifyAction, VERIFY_PASSWORD } from './verify-password.action';

@Injectable()
export class AuthEffect extends BaseEffect {

    @Effect()
    login$: Observable<ResponseAction> = this.getResponseAction(LOGIN, loginAction, isAuthFail);

    @Effect()
    signup$: Observable<ResponseAction> = this.getResponseAction(SIGNUP, signupAction, isAuthFail);

    @Effect()
    reset$: Observable<ResponseAction> = this.getResponseAction(RESET_PASSWORD, resetAction, isPwdFail);

    @Effect()
    setPwd$: Observable<ResponseAction> = this.getResponseAction(SET_PASSWORD, setAction, isPwdFail);

    @Effect()
    verify$: Observable<ResponseAction> = this.getResponseAction(VERIFY_PASSWORD, verifyAction);

    constructor(
        public actions$: Actions,
        public ws: WebsocketService
    ) {
        super(ws, actions$);
    }
}

function isAuthFail(res: LoginResponse): boolean
function isAuthFail(res: SignupResponse): boolean {
    return res.result !== 0;
}

function isPwdFail(res: ResetPasswordResponse): boolean
function isPwdFail(res: SetPasswordResponse): boolean {
    return !res.result;
}