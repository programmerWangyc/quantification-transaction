import { SET_PASSWORD } from './password.action';
import { ResponseUnit, SetPasswordResponse, ResetPasswordResponse } from './../../interfaces/response.interface';
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

import { LoginResponse, ResponseAction, SignupResponse } from '../../interfaces/response.interface';
import { WebsocketService } from '../../providers/websocket.service';
import { BaseEffect } from '../base.effect';
import { LOGIN } from './login.action';
import * as loginAction from './login.action';
import * as resetAction from './reset.action';
import { RESET_PASSWORD } from './reset.action';
import { SIGNUP } from './signup.action';
import * as signupAction from './signup.action';
import * as setAction from './password.action';

@Injectable()
export class AuthEffect extends BaseEffect {

    @Effect()
    login$: Observable<ResponseAction> = this.actions$
        .ofType(loginAction.LOGIN)
        .switchMap((action: loginAction.LoginRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(loginAction.LOGIN))
            .mergeMap(body => this.getSplitAction(body, loginAction, isAuthFail))
            .catch(error => Observable.of(error))
        );

    @Effect()
    signup$: Observable<ResponseAction> = this.actions$
        .ofType(signupAction.SIGNUP)
        .switchMap((action: signupAction.SignupRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(signupAction.SIGNUP))
            .mergeMap(body => this.getSplitAction(body, signupAction, isAuthFail))
            .catch(error => Observable.of(error))
        );

    @Effect()
    reset$: Observable<ResponseAction> = this.actions$
        .ofType(resetAction.RESET_PASSWORD)
        .switchMap((action: resetAction.ResetPasswordRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(resetAction.RESET_PASSWORD))
            .mergeMap(body => this.getSplitAction(body, resetAction, isPwdFail))
            .catch(error => Observable.of(error))
        );

    @Effect()
    setPwd$: Observable<ResponseAction> = this.actions$
        .ofType(setAction.SET_PASSWORD)
        .switchMap((action: setAction.SetPasswordRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(setAction.SET_PASSWORD))
            .mergeMap(body => this.getSplitAction(body, setAction, isPwdFail))
            .catch(error => Observable.of(error))
        );

    constructor(
        private actions$: Actions,
        private ws: WebsocketService
    ) {
        super();
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