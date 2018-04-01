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
import { SIGNUP } from './signup.action';
import * as signupAction from './signup.action';

@Injectable()
export class AuthEffect extends BaseEffect {

    @Effect()
    login$: Observable<ResponseAction> = this.actions$
        .ofType(LOGIN)
        .switchMap((action: loginAction.LoginRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(LOGIN))
            .mergeMap(body => this.getSplitAction(body, loginAction, this.isLoginFail))
            .catch(error => Observable.of(error))
        );

    @Effect()
    signup$: Observable<ResponseAction> = this.actions$
        .ofType(SIGNUP)
        .switchMap((action: signupAction.SignupRequestAction) => this.ws
            .send(this.getParams(action))
            .takeUntil(this.actions$.ofType(SIGNUP))
            .mergeMap(body => this.getSplitAction(body, signupAction, this.isSignupFail))
            .catch(error => Observable.of(error))
        );

    constructor(
        private actions$: Actions,
        private ws: WebsocketService
    ) {
        super();
    }

    isLoginFail(res: LoginResponse): boolean {
        return res.result !== 0;
    }

    isSignupFail(res: SignupResponse): boolean {
        return res.result !== 0;
    }
}