import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { delayWhen, filter, map, mergeMap, switchMap, take } from 'rxjs/operators';

import { LoginRequest, SetPasswordRequest, SignupRequest } from '../../interfaces/request.interface';
import { ErrorService } from '../../providers/error.service';
import { ResetLoginErrorAction } from '../../store/auth/login.action';
import { ResetSetPasswordResponseAction } from '../../store/auth/password.action';
import { ResetResetPasswordResponseAction } from '../../store/auth/reset.action';
import { ResetSignupResponseAction, ToggleAgreeStateAction } from '../../store/auth/signup.action';
import {
    AppState,
    selectLoginResponse,
    selectNeedGoogleSecondaryVer,
    selectResetPasswordResponse,
    selectSignupResponse,
} from '../../store/index.reducer';
import { VerifyPasswordRequest } from './../../interfaces/request.interface';
import {
    LoginResponse,
    ResetPasswordResponse,
    SetPasswordResponse,
    SignupResponse,
    VerifyPasswordResponse,
} from './../../interfaces/response.interface';
import { ProcessService } from './../../providers/process.service';
import { TipService } from './../../providers/tip.service';
import { ResetVerifyPasswordResponseAction, StorePwdTemporaryAction } from './../../store/auth/verify-password.action';
import {
    selectAgreeState,
    selectSetPwdResponse,
    selectTemporaryPwd,
    selectVerifyPwdResponse,
} from './../../store/index.reducer';





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
        return this.process.processRegain(source
            .pipe(
                map(email => ({ email }))
            )
        );
    }

    launchSetPwd(source: Observable<SetPasswordRequest>): Subscription {
        return this.process.processSetPwd(source);
    }

    launchVerifyPassword(source: Observable<VerifyPasswordRequest>): Subscription {
        return this.process.processVerifyPwd(source);
    }

    /* =======================================================Date Acquisition======================================================= */

    // login
    private getLoginResponse(): Observable<LoginResponse> {
        return this.store.select(selectLoginResponse)
            .pipe(
                filter(data => !!data)
            );
    }

    needVerification(): Observable<boolean> {
        return this.store.select(selectNeedGoogleSecondaryVer);
    }

    isLoginSuccess(): Observable<boolean> {
        return this.getLoginResponse()
            .pipe(
                map(data => data.result === 0)
            );
    }

    resetLoginError(): void {
        this.store.dispatch(new ResetLoginErrorAction());
    }

    //signup
    private getSignupResponse(): Observable<SignupResponse> {
        return this.store.select(selectSignupResponse)
            .pipe(
                filter(data => !!data)
            );
    }

    isSignupSuccess(): Observable<boolean> {
        return this.getSignupResponse()
            .pipe(
                map(data => data.result === 0)
            );
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
            .pipe(
                mergeMap(isSuccess => this.translate.get(isSuccess ? 'SIGNUP_SUCCESS_TIP' : 'SIGNUP_FAIL_TIP'))
            )
            .subscribe(message => this.tip.showTip(message));
    }

    // reset password
    private getResetPasswordResponse(): Observable<ResetPasswordResponse> {
        return this.store.select(selectResetPasswordResponse)
            .pipe(
                filter(res => !!res)
            );
    }

    showResetPasswordResponse(): Subscription {
        return this.getResetPasswordResponse()
            .pipe(
                mergeMap(res => this.translate.get(res.result ? 'EMAIL_VALID_TIP' : 'EMAIL_INVALID_TIP'))
            )
            .subscribe(message => this.tip.showTip(message, 60000));
    }

    // set password
    private getSetPasswordResponse(): Observable<SetPasswordResponse> {
        return this.store.select(selectSetPwdResponse)
            .pipe(
                filter(res => !!res)
            );
    }

    showSetPasswordResponse(): Subscription {
        return this.getSetPasswordResponse()
            .pipe(
                mergeMap(res => this.translate.get(res.result ? 'SET_PWD_SUCCESS_TIP' : 'SET_PWD_FAIL_TIP'))
            )
            .subscribe(message => this.tip.showTip(message));
    }

    resetSetPasswordResponse(): void {
        this.store.dispatch(new ResetSetPasswordResponseAction());
    }

    // verify password
    private getVerifyPasswordResponse(): Observable<VerifyPasswordResponse> {
        return this.store.select(selectVerifyPwdResponse)
            .pipe(
                filter(v => !!v)
            );
    }

    verifyPasswordSuccess(): Observable<boolean> {
        return this.getVerifyPasswordResponse()
            .pipe(
                map(res => res.result),
                // .do(success => !success && this.tip.showTip('PASSWORD_VERIFY_FAILED'))
                filter(success => success)
            );
    }

    getTemporaryPwd(): Observable<string> {
        return this.store.select(selectTemporaryPwd)
            .pipe(
                filter(value => !!value)
            );
    }

    /* =======================================================Local Action======================================================= */

    /**
     * @description This action must take place after the VerifyPasswordSuccessAction action.
     */
    storePwdTemporary(pwd: Observable<string>): Subscription {
        return pwd
            .pipe(
                delayWhen(pwd => this.verifyPasswordSuccess())
            )
            .subscribe(pwd => this.store.dispatch(new StorePwdTemporaryAction(pwd)));
    }

    resetResetPasswordResponse(): void {
        this.store.dispatch(new ResetResetPasswordResponseAction());
    }

    resetVerifyPwdResponse(): void {
        this.store.dispatch(new ResetVerifyPasswordResponseAction());
    }

    /* =======================================================Error Handle======================================================= */

    handleLoginError(): Subscription {
        return this.error.handleResponseError(this.getLoginResponse());
    }

    handleSignupError(): Subscription {
        return this.error.handleResponseError(this.getSignupResponse());
    }

    handleResetPasswordError(): Subscription {
        return this.error.handleResponseError(this.getResetPasswordResponse());
    }

    handleSetPasswordError(): Subscription {
        return this.error.handleResponseError(this.getSetPasswordResponse());
    }

    handleVerifyPasswordError(): Subscription {
        return this.error.handleError(
            this.getVerifyPasswordResponse()
                .pipe(
                    filter(res => !!res.error),
                    switchMap(res => this.translate.get(res.error)),
                    take(1)
                )
        );
    }
}
