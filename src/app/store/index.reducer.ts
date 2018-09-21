import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, createSelector } from '@ngrx/store';

import * as account from './account/account.reducer';
import * as login from './auth/login.reducer';
import * as pwd from './auth/password.reducer';
import * as reset from './auth/reset.reducer';
import * as signup from './auth/signup.reducer';
import * as verifyPwd from './auth/verify-password.reducer';
import * as backtest from './backtest/backtest.reducer';
import * as bbs from './bbs/bbs.reducer';
import * as btNode from './bt-node/bt-node.reducer';
import * as charge from './charge/charge.reducer';
import * as comment from './comment/comment.reducer';
import * as doc from './document/document.reducer';
import * as exchange from './exchange/exchange.reducer';
import * as message from './message/message.reducer';
import * as platform from './platform/platform.reducer';
import * as pub from './public/public.reducer';
import * as robot from './robot/robot.reducer';
import { RouterStateUrl } from './router/router.reducer';
import * as simulation from './simulation/simulation.reducer';
import * as strategy from './strategy/strategy.reducer';
import * as watchDog from './watch-dog/watch-dog.reducer';

export interface AppState {
    account: account.State;
    backtest: backtest.State;
    bbs: bbs.State;
    btNode: btNode.State;
    charge: charge.State;
    comment: comment.State;
    doc: doc.State;
    exchange: exchange.State;
    login: login.State;
    message: message.State;
    platform: platform.State;
    pub: pub.State;
    pwd: pwd.State;
    reset: reset.State;
    robot: robot.State;
    route: RouterReducerState<RouterStateUrl>;
    signup: signup.State;
    simulation: simulation.State;
    strategy: strategy.State;
    verifyPwd: verifyPwd.State;
    watchDog: watchDog.State;
}

export const reducers: ActionReducerMap<AppState> = {
    account: account.reducer,
    backtest: backtest.reducer,
    bbs: bbs.reducer,
    btNode: btNode.reducer,
    charge: charge.reducer,
    comment: comment.reducer,
    doc: doc.reducer,
    exchange: exchange.reducer,
    login: login.reducer,
    message: message.reducer,
    platform: platform.reducer,
    pub: pub.reducer,
    pwd: pwd.reducer,
    reset: reset.reducer,
    robot: robot.reducer,
    route: routerReducer,
    signup: signup.reducer,
    simulation: simulation.reducer,
    strategy: strategy.reducer,
    verifyPwd: verifyPwd.reducer,
    watchDog: watchDog.reducer,
};




export const getPubState = (state: AppState) => state.pub;

export const selectPublicResponse = createSelector(getPubState, pub.getPublicResponse);
export const selectReferrer = createSelector(getPubState, pub.getReferrer);
export const selectSettings = createSelector(getPubState, pub.getSettings);
export const selectSettingsResponse = createSelector(getPubState, pub.getSettingsResponse);
export const selectLanguage = createSelector(getPubState, pub.getLanguage);
export const selectFooterState = createSelector(getPubState, pub.getFooterState);
export const selectEditorConfig = createSelector(getPubState, pub.getEditorConfig);
export const selectServerMsgSubscribeState = createSelector(getPubState, pub.getServerMsgSubscribeState);
export const selectLogoutResponse = createSelector(getPubState, pub.getLogoutRes);


export const selectChangeAlertThresholdSettingResponse = createSelector(getPubState, pub.getChangeAlertThresholdRes);


export const selectPublicRequestParams = createSelector(getPubState, pub.getRequestParams);


export const selectAccountSummaryResponse = createSelector(getPubState, pub.getAccountSummaryResponse);



const getRouteState = (state: AppState) => state.route;


export const selectRouteState = createSelector(getRouteState, state => state && state.state);




const getLoginState = (state: AppState) => state.login;
export const selectUsername = createSelector(getLoginState, login.getUsername);
export const selectLoginResponse = createSelector(getLoginState, login.getLoginResponse);
export const selectNeedGoogleSecondaryVer = createSelector(getLoginState, login.getNeedSecondaryVer);


const getSignupState = (state: AppState) => state.signup;
export const selectSignupResponse = createSelector(getSignupState, signup.getSingupResponse);
export const selectAgreeState = createSelector(getSignupState, signup.getAgreeState);


const getResetPwdState = (state: AppState) => state.reset;
export const selectResetPasswordResponse = createSelector(getResetPwdState, reset.getResetResponse);


const getSetPwdState = (state: AppState) => state.pwd;
export const selectSetPwdResponse = createSelector(getSetPwdState, pwd.getSetPwdResponse);


const getVerifyPwdState = (state: AppState) => state.verifyPwd;
export const selectVerifyPwdResponse = createSelector(getVerifyPwdState, verifyPwd.getVerifyResponse);
export const selectTemporaryPwd = createSelector(getVerifyPwdState, verifyPwd.getTemporaryPwd);




const getExchangeState = (state: AppState) => state.exchange;
export const selectExchangeListResponse = createSelector(getExchangeState, exchange.getExchangeListResponse);


export const selectExchangeUIState = createSelector(getExchangeState, exchange.getExchangeUIStateResponse);



const getRobotState = (state: AppState) => state.robot;


export const selectRobotListResState = createSelector(getRobotState, robot.getRobotListResState);
export const selectRobotListData = createSelector(getRobotState, robot.getRobotData);


export const selectPublicRobotListResponse = createSelector(getRobotState, robot.getPublicRobotListRes);


export const selectPublicRobotResponse = createSelector(getRobotState, robot.getPublicRobotRes);


export const selectRobotDetailResponse = createSelector(getRobotState, robot.getRobotDetailRes);


export const selectSubscribeRobotResponse = createSelector(getRobotState, robot.getSubscribeRobotRes);


export const selectRobotLogsResponse = createSelector(getRobotState, robot.getRobotLogsRes);
export const selectSyncRobotLogsResponse = createSelector(getRobotState, robot.getSyncLogsResponse);


export const selectRestartRobotResponse = createSelector(getRobotState, robot.getRestartRobotRes);


export const selectStopRobotResponse = createSelector(getRobotState, robot.getStopRobotRes);


export const selectRobotArgs = createSelector(getRobotState, robot.getRobotArgs);
export const selectRobotStrategyArgs = createSelector(selectRobotArgs, state => state ? state.strategyArgs : null);
export const selectRobotTemplateArgs = createSelector(selectRobotArgs, state => state ? state.templateArgs : null);
export const selectRobotCommandArgs = createSelector(selectRobotArgs, state => state ? state.commandArgs : null);


export const selectModifyRobotResponse = createSelector(getRobotState, robot.getModifyRobotRes);


export const selectCommandRobotResponse = createSelector(getRobotState, robot.getCommandRobotRes);


export const selectDeleteRobotResponse = createSelector(getRobotState, robot.getDeleteRobotRes);


export const selectSaveRobotResponse = createSelector(getRobotState, robot.getSaveRobotRes);


export const selectPluginRunResponse = createSelector(getRobotState, robot.getPluginRunRes);


export const selectRobotDefaultParams = createSelector(getRobotState, robot.getDefaultParams);
export const selectRobotDefaultLogParams = createSelector(selectRobotDefaultParams, state => state.robotLogs);
export const selectRobotProfitMaxPoint = createSelector(selectRobotDefaultParams, state => state.PROFIT_MAX_POINTS);
export const selectRobotStrategyMaxPoint = createSelector(selectRobotDefaultParams, state => state.STRATEGY_MAX_POINTS);


export const selectRobotLogMonitoringSound = createSelector(getRobotState, robot.getMonitoringSound);


export const selectRobotUiState = createSelector(getRobotState, robot.getUIState);
export const selectRobotRunningLogCurrentPage = createSelector(selectRobotUiState, state => state.currentRunningLogPage);
export const selectRobotProfitChartCurrentPage = createSelector(selectRobotUiState, state => state.currentProfitChartPage);
export const selectRobotStrategyChartCurrentPage = createSelector(selectRobotUiState, state => state.currentStrategyChartPage);


export const selectServerSendRobotMessage = createSelector(getRobotState, robot.getServerSendMessage);


export const selectRobotRequestParameters = createSelector(getRobotState, robot.getRequestParameter);
export const selectRobotLogRequestParameters = createSelector(selectRobotRequestParameters, state => state.robotLogs);



const getBtNodeState = (state: AppState) => state.btNode;


export const selectBtNodeListResponse = createSelector(getBtNodeState, btNode.getNodeListResponse);


export const selectDeleteNodeResponse = createSelector(getBtNodeState, btNode.getNodeDeleteResponse);


export const selectBtNodeUIState = createSelector(getBtNodeState, btNode.getUIState);


export const selectNodeHashResponse = createSelector(getBtNodeState, btNode.getNodeHashResponse);



const getPlatformState = (state: AppState) => state.platform;


export const selectPlatformListResponse = createSelector(getPlatformState, platform.getPlatformListResponse);

export const selectPlatformIsLoading = createSelector(getPlatformState, platform.getPlatformIsLoading);


export const selectPlatformDeleteResponse = createSelector(getPlatformState, platform.getPlatformDeleteRes);


export const selectPlatformRequests = createSelector(getPlatformState, platform.getPlatformRequests);


export const selectPlatformDetailResponse = createSelector(getPlatformState, platform.getPlatformDetailRes);


export const selectPlatformUpdateResponse = createSelector(getPlatformState, platform.getUpdatePlatformRes);



const getWatchDogState = (state: AppState) => state.watchDog;

export const selectSetWatchDogResponse = createSelector(getWatchDogState, watchDog.getSetWDResponse);
export const selectSetWatchDogRequest = createSelector(getWatchDogState, watchDog.getSetWDRequest);



const getStrategyState = (state: AppState) => state.strategy;


export const selectStrategyListResponse = createSelector(getStrategyState, strategy.getStrategyListRes);


export const selectStrategyRequestParams = createSelector(getStrategyState, strategy.getRequestParams);


export const selectShareStrategyResponse = createSelector(getStrategyState, strategy.getShareStrategyRes);


export const selectGenKeyResponse = createSelector(getStrategyState, strategy.getGenKeyResponse);


export const selectVerifyKeyResponse = createSelector(getStrategyState, strategy.getVerifyKeyRes);


export const selectDeleteStrategyResponse = createSelector(getStrategyState, strategy.getDeleteStrategyRes);


export const selectOpStrategyTokenResponse = createSelector(getStrategyState, strategy.getOpStrategyTokenRes);


export const selectStrategyDetailResponse = createSelector(getStrategyState, strategy.getStrategyDetailRes);


export const selectSaveStrategyResponse = createSelector(getStrategyState, strategy.getSaveStrategyRes);


export const selectStrategyUIState = createSelector(getStrategyState, strategy.getUIState);





export const selectTemplateSnapshots = createSelector(selectStrategyListResponse, selectStrategyDetailResponse, (list, detail) => {
    if (!list || !detail) return [];

    const currentTemplates = detail.result.strategy.templates || [];

    const currentIds = currentTemplates.map(item => item.id);

    const availableTemplates = list.result.strategies.map(data => {
        const { id, name, category, args, language, semanticArgs } = data;

        return { id, name, category, args, language, semanticArgs, source: '' };
    }).filter(item => currentIds.indexOf(item.id) === -1);

    return [...availableTemplates, ...currentTemplates];
});


export const selectStrategyListByNameResponse = createSelector(getStrategyState, strategy.getStrategyListByNameResponse);


export const selectPublicStrategyDetailResponse = createSelector(getStrategyState, strategy.getPublicStrategyDetailResponse);



const getChargeState = (state: AppState) => state.charge;


export const selectPaymentArgResponse = createSelector(getChargeState, charge.getPaymentArgRes);


export const selectPayOrdersResponse = createSelector(getChargeState, charge.getPayOrdersRes);


export const selectChargeRequestParams = createSelector(getChargeState, charge.getRequestArgs);
export const selectPaymentArgRequestParams = createSelector(selectChargeRequestParams, state => state && state.paymentArg);


export const selectServerSendRechargeMessage = createSelector(getChargeState, charge.getServerSendMessage);



const getBacktest = (state: AppState) => state.backtest;


export const selectBacktestUIState = createSelector(getBacktest, backtest.getUIState);


export const selectGetTemplatesResponse = createSelector(getBacktest, backtest.getTemplatesRes);
export const selectTemplatesResponses = createSelector(getBacktest, backtest.getTemplates);




export const selectBacktestTemplates = createSelector(selectTemplateSnapshots, selectTemplatesResponses, (snapshots, sources) => snapshots.map(snapshot => {
    const target = sources.find(item => item.id === snapshot.id);

    return target ? { ...snapshot, source: target.source } : snapshot;
}));


export const selectBacktestRequestParams = createSelector(getBacktest, backtest.getBacktestReqParams);


export const selectBacktestIOResponse = createSelector(getBacktest, backtest.getBacktestRes);


export const selectBacktestState = createSelector(getBacktest, backtest.getBacktestState);


export const selectBacktestServerSendMessage = createSelector(getBacktest, backtest.getServerSendMessage);

export const selectBacktestServerMessages = createSelector(getBacktest, backtest.getBacktestServerMessages);


export const selectBacktestResults = createSelector(getBacktest, backtest.getBacktestResults);


export const selectIsAllBacktestTasksCompleted = createSelector(getBacktest, backtest.isTasksAllCompleted);


export const selectIsAllBacktestResultReceived = createSelector(selectBacktestResults, selectBacktestUIState, (results, state) => {
    if (!results || !state) {
        return null;
    } else {
        return results.length === state.backtestTasks.length;
    }
});



const getComment = (state: AppState) => state.comment;


export const selectCommentListResponse = createSelector(getComment, comment.getCommentListRes);


export const selectSubmitResponse = createSelector(getComment, comment.getSubmitCommentRes);


export const selectCommentQiniuTokenResponse = createSelector(getComment, comment.getQiniuTokenRes);


export const selectCommentRequestParams = createSelector(getComment, comment.getRequestParams);


export const selectCommentUIState = createSelector(getComment, comment.getUIState);



const getBBSState = (state: AppState) => state.bbs;


export const selectBBSPlaneListResponse = createSelector(getBBSState, bbs.getPlaneListRes);


export const selectBBSNodeListResponse = createSelector(getBBSState, bbs.getNodeListRes);


export const selectBBSTopicListBySlugResponse = createSelector(getBBSState, bbs.getTopicListBySlugRes);


export const selectBBSRequestParams = createSelector(getBBSState, bbs.getRequestParams);


export const selectBBSTopicByIdResponse = createSelector(getBBSState, bbs.getTopicByIdRes);


export const selectBBSUiState = createSelector(getBBSState, bbs.getUIState);


export const selectAddBBSTopicResponse = createSelector(getBBSState, bbs.getAddTopiRes);


export const selectBBSQiniuTokenResponse = createSelector(getBBSState, bbs.getQiniuTokenRes);



const getDocument = (state: AppState) => state.doc;


export const selectDocumentResponse = createSelector(getDocument, doc.getTopicByIdRes);

export const selectDocumentUIState = createSelector(getDocument, doc.getUIState);



const getAccount = (state: AppState) => state.account;


export const selectChangePasswordResponse = createSelector(getAccount, account.getChangePasswordRes);


export const selectAccountRequestParams = createSelector(getAccount, account.getRequestArgs);


export const selectAccountUIState = createSelector(getAccount, account.getUIState);


export const selectChangeNicknameResponse = createSelector(getAccount, account.getNicknameRes);


export const selectGoogleAuthKeyResponse = createSelector(getAccount, account.getGoogleAuthKeyRes);


export const selectUnbindSNSResponse = createSelector(getAccount, account.getUnbindSNSRes);


export const selectBindGoogleAuthResponse = createSelector(getAccount, account.getBindGoogleAuthRes);


export const selectGetAccountResponse = createSelector(getAccount, account.getAccountRes);


export const selectGetShadowMemberResponse = createSelector(getAccount, account.getShadowMemberRes);


export const selectAddShadowMemberResponse = createSelector(getAccount, account.getAddShadowMemberRes);


export const selectUpdateShadowMemberResponse = createSelector(getAccount, account.getUpdateShadowMemberRes);


export const selectDeleteShadowMemberResponse = createSelector(getAccount, account.getDeleteShadowMemberRes);


export const selectLockShadowMemberResponse = createSelector(getAccount, account.getLockShadowMemberRes);


export const selectGetApiKeyListResponse = createSelector(getAccount, account.getApiKeyListRes);


export const selectCreateApiKeResponse = createSelector(getAccount, account.getCreateApiKeyListRes);


export const selectLockApiKeyResponse = createSelector(getAccount, account.getLockApiKeyListRes);


export const selectDeleteApiKeyResponse = createSelector(getAccount, account.getDeleteApiKeyListRes);


export const selectRegisterCodeResponse = createSelector(getAccount, account.getRegisterCodeRes);



const getMessageState = (state: AppState) => state.message;


export const selectGetMessageResponse = createSelector(getMessageState, message.getMessageRes);


export const selectDeleteMessageResponse = createSelector(getMessageState, message.getDeleteMessageRes);


export const selectGetAPMMessageResponse = createSelector(getMessageState, message.getAPMMessageRes);


export const selectDeleteAPMMessageResponse = createSelector(getMessageState, message.getDeleteAPMMessageRes);


export const selectGetBBSNotifyResponse = createSelector(getMessageState, message.getNotifyRes);


export const selectDeleteBBSNotifyResponse = createSelector(getMessageState, message.getDeleteNotifyRes);



const getSimulation = (state: AppState) => state.simulation;


export const selectSandboxTokenResponse = createSelector(getSimulation, simulation.getSandboxTokenRes);
