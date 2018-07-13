import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import * as Request from '../interfaces/request.interface';
import { LoginRequestAction } from '../store/auth/login.action';
import { VerifyPasswordRequestAction } from '../store/auth/verify-password.action';
import { GetPaymentArgRequestAction, GetPayOrdersRequestAction } from '../store/charge/charge.action';
import { GetExchangeListRequestAction } from '../store/exchange/exchange.action';
import { AppState } from '../store/index.reducer';
import { GetPlatformListRequestAction } from '../store/platform/platform.action';
import * as StrategyActions from '../store/strategy/strategy.action';
import { SetRobotWDRequestAction } from '../store/watch-dog/watch-dog.action';
import * as BacktestActions from '../store/backtest/backtest.action';
import { SetPasswordRequestAction } from '../store/auth/password.action';
import { ResetPasswordRequestAction } from '../store/auth/reset.action';
import { SignupRequestAction } from '../store/auth/signup.action';
import { GetNodeListRequestAction } from '../store/bt-node/bt-node.action';
import { GetSettingsRequestAction } from '../store/public/public.action';
import * as RobotActions from '../store/robot/robot.action';
import { TipService } from './tip.service';
import { BacktestIOType } from '../interfaces/request.interface';

@Injectable()
export class ProcessService {

    constructor(
        private store: Store<AppState>,
        private tip: TipService
    ) { }

    //  ===================================================Auth===================================================

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

    processVerifyPwd(params: Observable<Request.VerifyPasswordRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new VerifyPasswordRequestAction(params)));
    }

    //  ===================================================Exchange===================================================

    processExchangeList(params: Observable<Request.GetExchangeListRequest>): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetExchangeListRequestAction()));
    }

    //  ===================================================Robot===================================================

    processRobotList(params: Observable<Request.GetRobotListRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.GetRobotListRequestAction(params)));
    }

    processPublicRobot(params: Observable<Request.PublicRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.PublicRobotRequestAction(params)));
    }

    processRobotDetail(params: Observable<Request.GetRobotDetailRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.GetRobotDetailRequestAction(params)));
    }

    processSubscribeRobot(params: Observable<Request.SubscribeRobotRequest>, allowSeparateRequest: boolean): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.SubscribeRobotRequestAction(params, allowSeparateRequest)));
    }

    processRobotLogs(params: Observable<Request.GetRobotLogsRequest>, allSeparateRequest: boolean, isSyncAction): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.GetRobotLogsRequestAction(params, allSeparateRequest, isSyncAction)));
    }

    processRestartRobot(params: Observable<Request.RestartRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.RestartRobotRequestAction(params)));
    }

    processStopRobot(params: Observable<Request.StopRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.StopRobotRequestAction(params)));
    }

    processModifyRobot(params: Observable<Request.ModifyRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.ModifyRobotRequestAction(params)));
    }

    processCommandRobot(params: Observable<Request.CommandRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.CommandRobotRequestAction(params)));
    }

    processDeleteRobot(params: Observable<Request.DeleteRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.DeleteRobotRequestAction(params)))
    }

    processSaveRobot(params: Observable<Request.SaveRobotRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.SaveRobotRequestAction(params)))
    }

    processDebugRobot(params: Observable<Request.PluginRunRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new RobotActions.PluginRunRequestAction(params)));
    }

    //  ===================================================Node list===================================================

    processGetNodeList(params: Observable<Request.GetNodeListRequest>, allowSeparateRequest = false): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetNodeListRequestAction(null, allowSeparateRequest)));
    }

    //  ===================================================Platform list===================================================

    processGetPlatformList(params: Observable<Request.GetPlatformListRequest>): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetPlatformListRequestAction()));
    }

    //  ===================================================Watch dog===================================================

    processSetRobotWatchDog(params: Observable<Request.SetRobotWDRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new SetRobotWDRequestAction(params)));
    }

    //  ===================================================Strategy======================================================

    processStrategyList(params: Observable<Request.GetStrategyListRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.GetStrategyListRequestAction(params)));
    }

    processShareStrategy(params: Observable<Request.ShareStrategyRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.ShareStrategyRequestAction(params)));
    }

    processGenKey(params: Observable<Request.GenKeyRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.GenKeyRequestAction(params)));
    }

    processVerifyKey(params: Observable<Request.VerifyKeyRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.VerifyKeyRequestAction(params)));
    }

    processDeleteStrategy(params: Observable<Request.DeleteStrategyRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.DeleteStrategyRequestAction(params)));
    }

    processOpStrategyToken(params: Observable<Request.OpStrategyTokenRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.OpStrategyTokenRequestAction(params)));
    }

    processStrategyDetail(params: Observable<Request.GetStrategyDetailRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.GetStrategyDetailRequestAction(params)));
    }

    processSaveStrategy(params: Observable<Request.SaveStrategyRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new StrategyActions.SaveStrategyRequestAction(params)));
    }

    //  ===================================================Backtest======================================================

    processGetTemplates(params: Observable<Request.GetTemplatesRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new BacktestActions.GetTemplatesRequestAction(params)));
    }

    processBacktestIO(params: Observable<Request.BacktestIORequest>): Subscription {
        const getAction = (req: Request.BacktestIORequest) => {
            const { io } = req;

            switch (JSON.parse(io)[0]) {
                case BacktestIOType.putTask:
                    return BacktestActions.BacktestIORequestAction;
                case BacktestIOType.getTaskStatus:
                    return BacktestActions.BacktestStatusRequestAction;
                case BacktestIOType.getTaskResult:
                    return BacktestActions.BacktestResultRequestAction;
                case BacktestIOType.deleteTask:
                    return BacktestActions.DeleteBacktestRequestAction;
                case BacktestIOType.stopTask:
                    return BacktestActions.StopBacktestRequestAction;
                default:
                    throw new Error('No io action find!');
            }
        };

        return params.subscribe(params => {
            const Action = getAction(params);

            this.store.dispatch(new Action(params))
        });
    }

    //  ===================================================Charge======================================================

    processPayOrders(params: Observable<any>): Subscription {
        return params.subscribe(_ => this.store.dispatch(new GetPayOrdersRequestAction()));
    }

    processPaymentArg(params: Observable<Request.GetPaymentArgRequest>): Subscription {
        return params.subscribe(params => this.store.dispatch(new GetPaymentArgRequestAction(params)));
    }
}
