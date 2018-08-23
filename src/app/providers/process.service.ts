import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';

import * as Request from '../interfaces/request.interface';
import { LoginRequestAction } from '../store/auth/login.action';
import { SetPasswordRequestAction } from '../store/auth/password.action';
import { ResetPasswordRequestAction } from '../store/auth/reset.action';
import { SignupRequestAction } from '../store/auth/signup.action';
import { VerifyPasswordRequestAction } from '../store/auth/verify-password.action';
import * as BacktestActions from '../store/backtest/backtest.action';
import * as BBSActions from '../store/bbs/bbs.action';
import * as BtNode from '../store/bt-node/bt-node.action';
import { GetPaymentArgRequestAction, GetPayOrdersRequestAction } from '../store/charge/charge.action';
import * as CommentActions from '../store/comment/comment.action';
import * as DocumentActions from '../store/document/document.action';
import { GetExchangeListRequestAction } from '../store/exchange/exchange.action';
import { AppState } from '../store/index.reducer';
import * as PlatformActions from '../store/platform/platform.action';
import { GetSettingsRequestAction, LogoutRequestAction, ChangeAlertThresholdSettingRequestAction } from '../store/public/public.action';
import * as RobotActions from '../store/robot/robot.action';
import * as SimulationActions from '../store/simulation/simulation.action';
import * as StrategyActions from '../store/strategy/strategy.action';
import { SetWDRequestAction } from '../store/watch-dog/watch-dog.action';
import * as AccountActions from '../store/account/account.action';
import * as MessageActions from '../store/message/message.action';

/**
 * @ignore
 */
@Injectable()
export class ProcessService {

    constructor(
        private store: Store<AppState>,
    ) { }

    //  ===================================================Public===================================================

    processSettings(paramObs: Observable<Request.SettingsRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new GetSettingsRequestAction(params)));
    }

    processChangeAlertThresholdSetting(paramObs: Observable<Request.ChangeAlertThresholdSettingRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new ChangeAlertThresholdSettingRequestAction(params)));
    }

    //  ===================================================Auth===================================================

    processLogin(paramObs: Observable<Request.LoginRequest>): Subscription {
        return paramObs.subscribe(data => this.store.dispatch(new LoginRequestAction(data)));
    }

    processSignup(paramObs: Observable<Request.SignupRequest>): Subscription {
        return paramObs.subscribe(data => this.store.dispatch(new SignupRequestAction(data)));
    }

    processRegain(paramObs: Observable<Request.ResetPasswordRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new ResetPasswordRequestAction(params)));
    }

    processSetPwd(paramObs: Observable<Request.SetPasswordRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new SetPasswordRequestAction((params))));
    }

    processVerifyPwd(paramObs: Observable<Request.VerifyPasswordRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new VerifyPasswordRequestAction(params)));
    }

    processLogout(paramObs: Observable<Request.LoginRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new LogoutRequestAction(params)));
    }

    //  ===================================================Exchange===================================================

    processExchangeList(paramObs: Observable<Request.GetExchangeListRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new GetExchangeListRequestAction()));
    }

    //  ===================================================Robot===================================================

    processRobotList(paramObs: Observable<Request.GetRobotListRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.GetRobotListRequestAction(params)));
    }

    processPublicRobotList(paramObs: Observable<Request.GetPublicRobotListRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.GetPublicRobotListRequestAction(params)));
    }

    processPublicRobot(paramObs: Observable<Request.PublicRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.PublicRobotRequestAction(params)));
    }

    processRobotDetail(paramObs: Observable<Request.GetRobotDetailRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.GetRobotDetailRequestAction(params)));
    }

    processSubscribeRobot(paramObs: Observable<Request.SubscribeRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.SubscribeRobotRequestAction(params)));
    }

    processRobotLogs(paramObs: Observable<Request.GetRobotLogsRequest>, isSyncAction): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.GetRobotLogsRequestAction(params, isSyncAction)));
    }

    processRestartRobot(paramObs: Observable<Request.RestartRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.RestartRobotRequestAction(params)));
    }

    processStopRobot(paramObs: Observable<Request.StopRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.StopRobotRequestAction(params)));
    }

    processModifyRobot(paramObs: Observable<Request.ModifyRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.ModifyRobotRequestAction(params)));
    }

    processCommandRobot(paramObs: Observable<Request.CommandRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.CommandRobotRequestAction(params)));
    }

    processDeleteRobot(paramObs: Observable<Request.DeleteRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.DeleteRobotRequestAction(params)));
    }

    processSaveRobot(paramObs: Observable<Request.SaveRobotRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.SaveRobotRequestAction(params)));
    }

    processDebugRobot(paramObs: Observable<Request.PluginRunRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new RobotActions.PluginRunRequestAction(params)));
    }

    //  ===================================================Agent ===================================================

    processGetNodeList(paramObs: Observable<Request.GetNodeListRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new BtNode.GetNodeListRequestAction(null)));
    }

    processDeleteNode(paramObs: Observable<Request.DeleteNodeRequest>): Subscription {
        return paramObs.subscribe(param => this.store.dispatch(new BtNode.DeleteNodeRequestAction(param)));
    }

    processGetNodeHash(paramObs: Observable<Request.GetNodeHashRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new BtNode.GetNodeHashRequestAction(null)));
    }

    //  ===================================================Platform===================================================

    processGetPlatformList(paramObs: Observable<Request.GetPlatformListRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new PlatformActions.GetPlatformListRequestAction(null)));
    }

    processDeletePlatform(paramObs: Observable<Request.DeletePlatformRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new PlatformActions.DeletePlatformRequestAction(params)));
    }

    processGetPlatformDetail(paramsObs: Observable<Request.GetPlatformDetailRequest>): Subscription {
        return paramsObs.subscribe(params => this.store.dispatch(new PlatformActions.GetPlatformDetailRequestAction(params)));
    }

    processUpdatePlatform(paramObs: Observable<Request.SavePlatformRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new PlatformActions.SavePlatformRequestAction(params)));
    }

    //  ===================================================Watch dog===================================================

    processSetWatchDog(paramObs: Observable<Request.SetWDRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new SetWDRequestAction(params)));
    }

    //  ===================================================Strategy======================================================

    processStrategyList(paramObs: Observable<Request.GetStrategyListRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.GetStrategyListRequestAction(params)));
    }

    processShareStrategy(paramObs: Observable<Request.ShareStrategyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.ShareStrategyRequestAction(params)));
    }

    processGenKey(paramObs: Observable<Request.GenKeyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.GenKeyRequestAction(params)));
    }

    processVerifyKey(paramObs: Observable<Request.VerifyKeyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.VerifyKeyRequestAction(params)));
    }

    processDeleteStrategy(paramObs: Observable<Request.DeleteStrategyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.DeleteStrategyRequestAction(params)));
    }

    processOpStrategyToken(paramObs: Observable<Request.OpStrategyTokenRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.OpStrategyTokenRequestAction(params)));
    }

    processStrategyDetail(paramObs: Observable<Request.GetStrategyDetailRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.GetStrategyDetailRequestAction(params)));
    }

    processSaveStrategy(paramObs: Observable<Request.SaveStrategyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.SaveStrategyRequestAction(params)));
    }

    processStrategyListByName(paramObs: Observable<Request.GetStrategyListByNameRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.GetStrategyListByNameRequestAction(params)));
    }

    processPublicStrategyDetail(paramObs: Observable<Request.GetPublicStrategyDetailRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new StrategyActions.GetPublicStrategyDetailRequestAction(params)));
    }

    //  ===================================================Backtest======================================================

    processGetTemplates(paramObs: Observable<Request.GetTemplatesRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new BacktestActions.GetTemplatesRequestAction(params)));
    }

    processBacktestIO(paramObs: Observable<Request.BacktestIORequest>): Subscription {
        const getAction = (req: Request.BacktestIORequest) => {
            const { io } = req;

            switch (JSON.parse(io)[0]) {
                case Request.BacktestIOType.putTask:
                    return BacktestActions.BacktestIORequestAction;
                case Request.BacktestIOType.getTaskStatus:
                    return BacktestActions.BacktestStatusRequestAction;
                case Request.BacktestIOType.getTaskResult:
                    return BacktestActions.BacktestResultRequestAction;
                case Request.BacktestIOType.deleteTask:
                    return BacktestActions.DeleteBacktestRequestAction;
                case Request.BacktestIOType.stopTask:
                    return BacktestActions.StopBacktestRequestAction;
                default:
                    throw new Error('No io action find!');
            }
        };

        return paramObs.subscribe(params => {
            const Action = getAction(params);

            this.store.dispatch(new Action(params));
        });
    }

    processWorkBacktest(resultObs: Observable<WorkerBacktest.WorkerResult>): Subscription {
        return resultObs.subscribe(result => {
            const { Finished } = result;

            if (Finished) {
                this.store.dispatch(new BacktestActions.WorkerBacktestSuccessAction(result));
            } else {
                this.store.dispatch(new BacktestActions.WorkerBacktestStatusUpdatedAction(result));
            }
        });
    }

    //  ===================================================Charge======================================================

    processPayOrders(paramObs: Observable<any>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new GetPayOrdersRequestAction()));
    }

    processPaymentArg(paramObs: Observable<Request.GetPaymentArgRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new GetPaymentArgRequestAction(params)));
    }

    //  ===================================================Comment======================================================

    processCommentList(paramsObs: Observable<Request.GetCommentListRequest>): Subscription {
        return paramsObs.subscribe(params => this.store.dispatch(new CommentActions.GetCommentListRequestAction(params)));
    }

    processAddComment(paramObs: Observable<Request.SubmitCommentRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new CommentActions.AddCommentRequestAction(params)));
    }

    processDeleteComment(paramObs: Observable<Request.SubmitCommentRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new CommentActions.DeleteCommentRequestAction(params)));
    }

    processUpdateComment(paramObs: Observable<Request.SubmitCommentRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new CommentActions.UpdateCommentRequestAction(params)));
    }

    processCommentGetQiniuToken(paramObs: Observable<Request.GetQiniuTokenRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new CommentActions.GetQiniuTokenRequestAction(params)));
    }

    //  =========================================================BBS======================================================

    processBBSPlaneList(paramObs: Observable<Request.GetBBSPlaneListRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new BBSActions.GetBBSPlaneListRequestAction()));
    }

    processBBSNodeList(paramObs: Observable<Request.GetBBSNodeListRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new BBSActions.GetBBSNodeListRequestAction()));
    }

    processBBSTopicListBySlug(paramObs: Observable<Request.GetBBSTopicListBySlugRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new BBSActions.GetBBSTopicListBySlugRequestAction(params)));
    }

    processBBSTopicById(paramObs: Observable<Request.GetBBSTopicRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new BBSActions.GetBBSTopicRequestAction(params)));
    }

    processAddBBSTopic(paramObs: Observable<Request.AddBBSTopicRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new BBSActions.AddBBSTopicRequestAction(params)));
    }

    processBBSGetQiniuToken(paramObs: Observable<Request.GetQiniuTokenRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new BBSActions.GetBBSQiniuTokenRequestAction(params)));
    }

    //  ===================================================Document======================================================

    processDocument(paramObs: Observable<Request.GetBBSTopicRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new DocumentActions.GetDocumentRequestAction(params)));
    }

    //  ===================================================Account======================================================

    processChangePassword(paramObs: Observable<Request.ChangePasswordRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.ChangePasswordRequestAction(params)));
    }

    processChangeNickname(paramObs: Observable<Request.ChangeNickNameRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.ChangeNickNameRequestAction(params)));
    }

    processGetGoogleAuthKey(paramObs: Observable<Request.GetGoogleAuthKeyRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new AccountActions.GetGoogleAuthKeyRequestAction()));
    }

    processUnbindSNS(paramObs: Observable<Request.UnbindSNSRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new AccountActions.UnbindSNSRequestAction()));
    }

    processBindGoogleAuth(paramObs: Observable<Request.BindGoogleAuthRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.BindGoogleAuthRequestAction(params)));
    }

    processGetAccount(paramObs: Observable<Request.GetAccountRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new AccountActions.GetAccountRequestAction()));
    }

    processGetShadowMember(paramObs: Observable<Request.GetShadowMemberRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new AccountActions.GetShadowMemberRequestAction()));
    }

    processSaveShadowMember(paramObs: Observable<Request.SaveShadowMemberRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.AddShadowMemberRequestAction(params)));
    }

    processUpdateShadowMember(paramObs: Observable<Request.SaveShadowMemberRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.UpdateShadowMemberRequestAction(params)));
    }

    processDeleteShadowMember(paramObs: Observable<Request.DeleteShadowMemberRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.DeleteShadowMemberRequestAction(params)));
    }

    processLockShadowMember(paramObs: Observable<Request.LockShadowMemberRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.LockShadowMemberRequestAction(params)));
    }

    processGetApiKeyList(paramObs: Observable<Request.GetApiKeyListRequest>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new AccountActions.GetApiKeyListRequestAction()));
    }

    processCreateApiKey(paramObs: Observable<Request.CreateApiKeyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.CreateApiKeyRequestAction(params)));
    }

    processLockApiKey(paramObs: Observable<Request.LockApiKeyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.LockApiKeyRequestAction(params)));
    }

    processDeleteApiKey(paramObs: Observable<Request.DeleteApiKeyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new AccountActions.DeleteApiKeyRequestAction(params)));
    }

    //  ===================================================Message======================================================

    processGetMessage(paramObs: Observable<Request.GetMessageRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new MessageActions.GetMessageRequestAction(params)));
    }

    processDeleteMessage(paramObs: Observable<Request.DeleteMessageRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new MessageActions.DeleteMessageRequestAction(params)));
    }

    processGetAPMMessage(paramObs: Observable<Request.GetAPMMessageRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new MessageActions.GetAPMMessageRequestAction(params)));
    }

    processDeleteAPMMessage(paramObs: Observable<Request.DeleteAPMMessageRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new MessageActions.DeleteAPMMessageRequestAction(params)));
    }

    processGetBBSNotify(paramObs: Observable<Request.GetBBSNotifyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new MessageActions.GetBBSNotifyRequestAction(params)));
    }

    processDeleteBBSNotify(paramObs: Observable<Request.DeleteBBSNotifyRequest>): Subscription {
        return paramObs.subscribe(params => this.store.dispatch(new MessageActions.DeleteBBSNotifyRequestAction(params)));
    }

    //  ===================================================Simulation======================================================

    /**
     * @deprecated 实盘仿真的接口
     */
    processSandboxToken(paramObs: Observable<any>): Subscription {
        return paramObs.subscribe(_ => this.store.dispatch(new SimulationActions.GetSandBoxTokenRequestAction()));
    }
}
