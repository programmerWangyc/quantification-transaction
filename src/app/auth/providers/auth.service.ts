import { TipService } from './../../providers/tip.service';
import 'rxjs/add/operator/startWith';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { LoginRequest, SignupRequest, SetPasswordRequest } from '../../interfaces/request.interface';
import { ErrorService } from '../../providers/error.service';
import { ToggleAgreeStateAction,  ResetSignupResponseAction } from '../../store/auth/signup.action';
import { AppState, selectLoginResponse, selectSignupResponse, selectResetPasswordResponse } from '../../store/index.reducer';
import { LoginResponse, SignupResponse, ResetPasswordResponse, SetPasswordResponse } from './../../interfaces/response.interface';
import { ProcessService } from './../../providers/process.service';
import { selectAgreeState, selectSetPwdResponse } from './../../store/index.reducer';
import { ResetLoginErrorAction } from '../../store/auth/login.action';
import { ResetSetPasswordResponseAction } from '../../store/auth/password.action';
import { ResetResetPasswordResponseAction } from '../../store/auth/reset.action';

@Injectable()
export class AuthService {

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private translate: TranslateService,
        private tip: TipService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    launchLogin(source: Observable<LoginRequest>): Subscription {
        return this.process.processLogin(source);
    }

    launchSignup(source: Observable<SignupRequest>): Subscription {
        return this.process.processSignup(source);
    }

    launchRegain(source: Observable<string>): Subscription {
        return this.process.processRegain(source.map(email => ({ email })));
    }

    launchSetPwd(source: Observable<SetPasswordRequest>): Subscription {
        return this.process.processSetPwd(source);
    }

    /* =======================================================Date Acquisition======================================================= */

    // login 
    private getLoginResponse(): Observable<LoginResponse> {
        return this.store.select(selectLoginResponse)
            .filter(data => !!data);
    }

    needVerification(): Observable<boolean> {
        return this.getLoginResponse()
            .map(response => response.result === -2)
            .startWith(false);
    }

    isLoginSuccess(): Observable<boolean> {
        return this.getLoginResponse()
            .map(data => data.result === 0);
    }

    resetLoginError(): void {
        this.store.dispatch(new ResetLoginErrorAction());
    }

    //signup
    private getSignupResponse(): Observable<SignupResponse> {
        return this.store.select(selectSignupResponse)
            .filter(data => !!data);
    }

    isSignupSuccess(): Observable<boolean> {
        return this.getSignupResponse()
            .map(data => data.result === 0);
    }

    isAgree(): Observable<boolean> {
        return this.store.select(selectAgreeState);
    }

    toggleAgreeState(state: Observable<boolean>): Subscription {
        return state.subscribe(state => this.store.dispatch(new ToggleAgreeStateAction(state)));
    }

    resetSignupResponse(): void {
        this.store.dispatch(new ResetSignupResponseAction());
    }

    showSignupResponse(): Subscription {
        return this.isSignupSuccess()
            .mergeMap(isSuccess => this.translate.get(isSuccess ? 'SIGNUP_SUCCESS_TIP' : 'SIGNUP_FAIL_TIP'))
            .subscribe(message => this.tip.showTip(message));
    }

    // reset password
    private getResetPasswordResponse(): Observable<ResetPasswordResponse> {
        return this.store.select(selectResetPasswordResponse)
            .filter(res => !!res);
    }

    showResetPasswordResponse(): Subscription {
        return this.getResetPasswordResponse()
            .mergeMap(res => this.translate.get(res.result ? 'EMAIL_VALID_TIP' : 'EMAIL_INVALID_TIP'))
            .subscribe(message => this.tip.showTip(message, 60000));
    }

    resetResetPasswordResponse(): void {
        this.store.dispatch(new ResetResetPasswordResponseAction());
    }

    // set password
    private getSetPasswordResponse(): Observable<SetPasswordResponse> {
        return this.store.select(selectSetPwdResponse)
            .filter(res => !!res);
    }

    showSetPasswordResponse(): Subscription {
        return this.getSetPasswordResponse()
            .mergeMap(res => this.translate.get(res.result ? 'SET_PWD_SUCCESS_TIP' : 'SET_PWD_FAIL_TIP'))
            .subscribe(message => this.tip.showTip(message));
    }

    resetSetPasswordResponse(): void {
        this.store.dispatch(new ResetSetPasswordResponseAction());
    }

    /* =======================================================Error Handle======================================================= */

    handleLoginError(): Subscription {
        return this.error.handleResponseError(
            this.getLoginResponse()
                .filter(data => !!data.error)
                .mergeMap(data => this.translate.get(data.error))
        );
    }

    handleSignupError(): Subscription {
        return this.error.handleResponseError(
            this.getSignupResponse()
                .filter(data => !!data.error)
                .mergeMap(data => this.translate.get(data.error))
        );
    }

    handleResetPasswordError(): Subscription {
        return this.error.handleResponseError(
            this.getResetPasswordResponse()
                .filter(data => !!data.error)
                .map(data => data.error)
        );
    }

    handleSetPasswordError(): Subscription {
        return this.error.handleResponseError(
            this.getSetPasswordResponse()
                .filter(data => !!data.error)
                .map(data => data.error)
        )
    }
}
