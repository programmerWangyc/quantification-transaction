import { SetPasswordRequestAction } from './../store/auth/password.action';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as request from '../interfaces/request.interface';
import { LoginRequestAction } from '../store/auth/login.action';
import { AppState } from '../store/index.reducer';
import { ResetPasswordRequestAction } from './../store/auth/reset.action';
import { SignupRequestAction } from './../store/auth/signup.action';
import { GetSettingsRequestAction } from './../store/public/public.action';

@Injectable()
export class ProcessService {

    constructor(private store: Store<AppState>) { }

    processLogin(source: Observable<request.LoginRequest>): Subscription {
        return source.subscribe(data => this.store.dispatch(new LoginRequestAction(data)));
    }

    processSignup(source: Observable<request.SignupRequest>): Subscription {
       return source.subscribe(data => this.store.dispatch(new SignupRequestAction(data)));
    }
    
    processSettings(source: Observable<request.SettingsRequest>): Subscription {
        return source.subscribe(source => this.store.dispatch(new GetSettingsRequestAction(source)));
    }

    processRegain(source: Observable<request.ResetPasswordRequest>): Subscription {
        return source.subscribe(source => this.store.dispatch(new ResetPasswordRequestAction(source)));
    }

    processSetPwd(source: Observable<request.SetPasswordRequest>): Subscription {
        return source.subscribe(source => this.store.dispatch(new SetPasswordRequestAction((source))));
    }
}
