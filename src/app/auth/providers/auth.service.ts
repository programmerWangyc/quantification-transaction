import 'rxjs/add/operator/startWith';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { LoginRequest, SignupRequest } from '../../interfaces/request.interface';
import { ErrorService } from '../../providers/error.service';
import { ToggleAgreeStateAction } from '../../store/auth/signup.action';
import { AppState, selectLoginResponse, selectSignupResponse } from '../../store/index.reducer';
import { LoginResponse, SignupResponse } from './../../interfaces/response.interface';
import { ProcessService } from './../../providers/process.service';
import { selectAgreeState } from './../../store/index.reducer';

@Injectable()
export class AuthService {

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private translate: TranslateService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    launchLogin(source: Observable<LoginRequest>): Subscription {
        return this.process.processLogin(source);
    }

    launchSignup(source: Observable<SignupRequest>): Subscription {
        return this.process.processSignup(source);
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
        return state.subscribe(state => this.store.dispatch(new ToggleAgreeStateAction(state)),e => console.log(e), () => console.log('complete'));
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
}
