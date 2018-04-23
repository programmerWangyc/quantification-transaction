import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as Request from '../interfaces/request.interface';
import { LoginRequestAction } from '../store/auth/login.action';
import { VerifyPasswordRequestAction } from '../store/auth/verify-password.action';
import { GetExchangeListRequestAction } from '../store/exchange/exchange.action';
import { AppState } from '../store/index.reducer';
import { GetPlatformListRequestAction } from '../store/platform/platform.action';
import { SetPasswordRequestAction } from './../store/auth/password.action';
import { ResetPasswordRequestAction } from './../store/auth/reset.action';
import { SignupRequestAction } from './../store/auth/signup.action';
import { GetNodeListRequestAction } from './../store/bt-node/bt-node.action';
import { GetSettingsRequestAction } from './../store/public/public.action';
import {
    GetRobotDetailRequestAction,
    GetRobotListRequestAction,
    GetRobotLogsRequestAction,
    PublicRobotRequestAction,
    RestartRobotRequestAction,
    StopRobotRequestAction,
    SubscribeRobotRequestAction,
} from './../store/robot/robot.action';
import { TipService } from './tip.service';

@Injectable()
export class ProcessService {

    constructor(
        private store: Store<AppState>,
        private tip: TipService
    ) { }

    /** ===================================================Auth=================================================== */

    processLogin(params: Observable<Request.LoginRequest>): Subscription {
        return params.subscribe(data => this.store.dispatch(new LoginRequestAction(data)));
    }

    processSignup(params: Observable<Request.SignupRequest>): Subscription {
        return params.subscribe(data => this.store.dispatch(new SignupRequestAction(data)));
    }

    processSettings(params: Observable<Request.SettingsRequest>, allowSeparateRequest: boolean): Subscription {
        return params.subscribe(params => this.store.dispatch(new GetSettingsRequestAction(params, allowSeparateRequest)));
    }

    processRegain(params: Observable<Request.ResetPasswordRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new ResetPasswordRequestAction(params)));
    }

    processSetPwd(params: Observable<Request.SetPasswordRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new SetPasswordRequestAction((params))));
    }

    /** ===================================================Exchange=================================================== */

    processExchangeList(params: Observable<Request.GetExchangeListRequest>): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetExchangeListRequestAction()));
    }

    /** ===================================================Robot=================================================== */

    processRobotList(params: Observable<Request.GetRobotListRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new GetRobotListRequestAction(params)));
    }

    processPublicRobot(params: Observable<Request.PublicRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new PublicRobotRequestAction(params)));
    }

    processRobotDetail(params: Observable<Request.GetRobotDetailRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new GetRobotDetailRequestAction(params)));
    }

    processSubscribeRobot(params: Observable<Request.SubscribeRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new SubscribeRobotRequestAction(params)));
    }

    processRobotLogs(params: Observable<Request.GetRobotLogsRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new GetRobotLogsRequestAction(params)));
    }

    // processRestartRobot(params: Observable<any>): Subscription {
    processRestartRobot(params: Observable<Request.RestartRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RestartRobotRequestAction(params)));
    }

    processStopRobot(params: Observable<Request.StopRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StopRobotRequestAction(params)));
    }

    processGetNodeList(params: Observable<Request.GetNodeListRequest>): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetNodeListRequestAction()));
    }

    processGetPlatformList(params: Observable<Request.GetPlatformListRequest>): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetPlatformListRequestAction()));
    }

    processVerifyPwd(params: Observable<Request.VerifyPasswordRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new VerifyPasswordRequestAction(params)));
    }
}
