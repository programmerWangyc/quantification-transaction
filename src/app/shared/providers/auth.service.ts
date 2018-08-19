import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subscription, of } from 'rxjs';
import { delayWhen, filter, map, mergeMap, switchMap, take, delay } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import {
    LoginRequest, SetPasswordRequest, SignupRequest, VerifyPasswordRequest
} from '../../interfaces/request.interface';
import {
    LoginResponse, ResetPasswordResponse, SetPasswordResponse, SignupResponse, VerifyPasswordResponse
} from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import { CloseSecondaryVerifyAction, ClearLoginInfoAction } from '../../store/auth/login.action';
import { ResetSetPasswordResponseAction } from '../../store/auth/password.action';
import { ResetResetPasswordResponseAction } from '../../store/auth/reset.action';
import { ResetSignupResponseAction, ToggleAgreeStateAction } from '../../store/auth/signup.action';
import { ResetVerifyPasswordResponseAction, StorePwdTemporaryAction } from '../../store/auth/verify-password.action';
import {
    AppState, selectAgreeState, selectLoginResponse, selectNeedGoogleSecondaryVer, selectResetPasswordResponse,
    selectSetPwdResponse, selectSignupResponse, selectTemporaryPwd, selectVerifyPwdResponse
} from '../../store/index.reducer';

@Injectable()
export class AuthService extends BaseService {

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private translate: TranslateService,
        private tip: TipService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    launchLogin(source: Observable<LoginRequest>): Subscription {
        return this.process.processLogin(source);
    }

    launchSignup(source: Observable<SignupRequest>): Subscription {
        return this.process.processSignup(source);
    }

    launchRegain(source: Observable<string>): Subscription {
        return this.process.processRegain(source.pipe(
            map(email => ({ email }))
        ));
    }

    launchSetPwd(source: Observable<SetPasswordRequest>): Subscription {
        return this.process.processSetPwd(source);
    }

    /**
     * 请求验证用户的密码
     * @param source 验证用户密码
     */
    launchVerifyPassword(source: Observable<VerifyPasswordRequest>): Subscription {
        return this.process.processVerifyPwd(source);
    }

    //  =======================================================Date Acquisition=======================================================

    // login
    private getLoginResponse(): Observable<LoginResponse> {
        return this.store.select(selectLoginResponse).pipe(
            this.filterTruth()
        );
    }

    needVerification(): Observable<boolean> {
        return this.store.select(selectNeedGoogleSecondaryVer);
    }

    isLoginSuccess(): Observable<boolean> {
        return this.getLoginResponse().pipe(
            map(data => data.result === 0)
        );
    }

    /**
     * 清除用户的登录信息
     */
    resetLoginInfo(): void {
        this.store.dispatch(new ClearLoginInfoAction());
    }

    // signup
    private getSignupResponse(): Observable<SignupResponse> {
        return this.store.select(selectSignupResponse).pipe(
            this.filterTruth()
        );
    }

    isSignupSuccess(): Observable<boolean> {
        return this.getSignupResponse().pipe(
            map(data => data.result === 0)
        );
    }

    isAgree(): Observable<boolean> {
        return this.store.select(selectAgreeState);
    }

    toggleAgreeState(state: Observable<boolean>): Subscription {
        return state.subscribe(isAgree => this.store.dispatch(new ToggleAgreeStateAction(isAgree)));
    }

    resetSignupResponse(): void {
        this.store.dispatch(new ResetSignupResponseAction());
    }

    showSignupResponse(): Subscription {
        return this.isSignupSuccess().pipe(
            mergeMap(isSuccess => this.translate.get(isSuccess ? 'SIGNUP_SUCCESS_TIP' : 'SIGNUP_FAIL_TIP'))
        )
            .subscribe(message => this.tip.showTip(message));
    }

    // reset password
    private getResetPasswordResponse(): Observable<ResetPasswordResponse> {
        return this.store.select(selectResetPasswordResponse).pipe(
            filter(res => !!res)
        );
    }

    showResetPasswordResponse(): Subscription {
        return this.getResetPasswordResponse().pipe(
            mergeMap(res => this.translate.get(res.result ? 'EMAIL_VALID_TIP' : 'EMAIL_INVALID_TIP'))
        )
            .subscribe(message => this.tip.showTip(message, 60000));
    }

    // set password
    private getSetPasswordResponse(): Observable<SetPasswordResponse> {
        return this.store.select(selectSetPwdResponse).pipe(
            this.filterTruth()
        );
    }

    showSetPasswordResponse(): Subscription {
        return this.getSetPasswordResponse().pipe(
            mergeMap(res => this.translate.get(res.result ? 'SET_PWD_SUCCESS_TIP' : 'SET_PWD_FAIL_TIP'))
        )
            .subscribe(message => this.tip.showTip(message));
    }

    resetSetPasswordResponse(): void {
        this.store.dispatch(new ResetSetPasswordResponseAction());
    }

    // verify password
    private getVerifyPasswordResponse(): Observable<VerifyPasswordResponse> {
        return this.store.select(selectVerifyPwdResponse).pipe(
            this.filterTruth()
        );
    }

    verifyPasswordSuccess(): Observable<boolean> {
        return this.getVerifyPasswordResponse().pipe(
            map(res => res.result),
            // .do(success => !success && this.tip.showTip('PASSWORD_VERIFY_FAILED'))
            this.filterTruth()
        );
    }

    /**
     * 验证通过的密码
     */
    getTemporaryPwd(): Observable<string> {
        return this.store.select(selectTemporaryPwd).pipe(
            this.filterTruth()
        );
    }

    //  =======================================================Local Action=======================================================

    /**
     * This action must take place after the VerifyPasswordSuccessAction action.
     */
    storePwdTemporary(pwdObs: Observable<string>): Subscription {
        return pwdObs.pipe(
            delayWhen(_ => this.verifyPasswordSuccess())
        ).subscribe(pwd => {
            this.store.dispatch(new StorePwdTemporaryAction(pwd));
            this.clearPwdTemporary();
        });
    }

    resetResetPasswordResponse(): void {
        this.store.dispatch(new ResetResetPasswordResponseAction());
    }

    resetVerifyPwdResponse(): void {
        this.store.dispatch(new ResetVerifyPasswordResponseAction());
    }

    /**
     * 清除谷歌二次验证码
     */
    closeSecondaryVerify(): void {
        this.store.dispatch(new CloseSecondaryVerifyAction());
    }

    /**
     * 清理密码
     */
    private clearPwdTemporary(): Subscription {
        return of(null).pipe(
            delay(5 * 60 * 1000)
        ).subscribe(_ => this.resetVerifyPwdResponse());
    }

    //  =======================================================Error Handle=======================================================

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
            this.getVerifyPasswordResponse().pipe(
                filter(res => !!res.error),
                switchMap(res => this.translate.get(res.error)),
                take(1)
            )
        );
    }
}
