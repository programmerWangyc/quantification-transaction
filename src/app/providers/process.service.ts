import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as Request from '../interfaces/request.interface';
import { LoginRequestAction } from '../store/auth/login.action';
import { GetExchangeListRequestAction } from '../store/exchange/exchange.action';
import { AppState } from '../store/index.reducer';
import { SetPasswordRequestAction } from './../store/auth/password.action';
import { ResetPasswordRequestAction } from './../store/auth/reset.action';
import { SignupRequestAction } from './../store/auth/signup.action';
import { GetSettingsRequestAction } from './../store/public/public.action';
import { GetRobotListRequestAction } from './../store/robot/robot.action';

@Injectable()
export class ProcessService {

    constructor(private store: Store<AppState>) { }

    processLogin(source: Observable<Request.LoginRequest>): Subscription {
        return source.subscribe(data => this.store.dispatch(new LoginRequestAction(data)));
    }

    processSignup(source: Observable<Request.SignupRequest>): Subscription {
        return source.subscribe(data => this.store.dispatch(new SignupRequestAction(data)));
    }

    processSettings(source: Observable<Request.SettingsRequest>, allowSeparateRequest: boolean): Subscription {
        return source.subscribe(source => this.store.dispatch(new GetSettingsRequestAction(source, allowSeparateRequest)));
    }

    processRegain(source: Observable<Request.ResetPasswordRequest>): Subscription {
        return source.subscribe(source => this.store.dispatch(new ResetPasswordRequestAction(source)));
    }

    processSetPwd(source: Observable<Request.SetPasswordRequest>): Subscription {
        return source.subscribe(source => this.store.dispatch(new SetPasswordRequestAction((source))));
    }

    processExchangeList(source: Observable<Request.GetExchangeListRequest>): Subscription {
        return source.subscribe(_ => this.store.dispatch(new GetExchangeListRequestAction()));
    }

    processRobotList(source: Observable<Request.GetRobotListRequest>): Subscription {
        return source.subscribe(source => this.store.dispatch(new GetRobotListRequestAction(source)));
    }
}
