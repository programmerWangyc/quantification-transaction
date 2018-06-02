import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, createSelector } from '@ngrx/store';

import * as login from './auth/login.reducer';
import * as pwd from './auth/password.reducer';
import * as reset from './auth/reset.reducer';
import * as signup from './auth/signup.reducer';
import * as verifyPwd from './auth/verify-password.reducer';
import * as btNode from './bt-node/bt-node.reducer';
import * as charge from './charge/charge.reducer';
import * as exchange from './exchange/exchange.reducer';
import * as platform from './platform/platform.reducer';
import * as pub from './public/public.reducer';
import * as robot from './robot/robot.reducer';
import { RouterStateUrl } from './router/router.reducer';
import * as strategy from './strategy/strategy.reducer';
import * as watchDog from './watch-dog/watch-dog.reducer';

export interface AppState {
    btNode: btNode.State,
    charge: charge.State,
    exchange: exchange.State,
    login: login.State,
    platform: platform.State,
    pub: pub.State,
    pwd: pwd.State,
    reset: reset.State,
    robot: robot.State,
    route: RouterReducerState<RouterStateUrl>,
    signup: signup.State,
    strategy: strategy.State,
    verifyPwd: verifyPwd.State,
    watchDog: watchDog.State,
}

export const reducers: ActionReducerMap<AppState> = {
    btNode: btNode.reducer,
    charge: charge.reducer,
    exchange: exchange.reducer,
    login: login.reducer,
    platform: platform.reducer,
    pub: pub.reducer,
    pwd: pwd.reducer,
    reset: reset.reducer,
    robot: robot.reducer,
    route: routerReducer,
    signup: signup.reducer,
    strategy: strategy.reducer,
    verifyPwd: verifyPwd.reducer,
    watchDog: watchDog.reducer,
}


//public information
export const getPublicInformationState = (state: AppState) => state.pub;
export const selectUsernameFromPublic = createSelector(getPublicInformationState, pub.getUsername);
export const selectToken = createSelector(getPublicInformationState, pub.getToken);
export const selectBalance = createSelector(getPublicInformationState, pub.getBalance);
export const selectConsumed = createSelector(getPublicInformationState, pub.getConsumed);
export const selectVersion = createSelector(getPublicInformationState, pub.getVersion);
export const selectIsAdmin = createSelector(getPublicInformationState, pub.getIsAdmin);
export const selectReferrer = createSelector(getPublicInformationState, pub.getReferrer);
export const selectSettings = createSelector(getPublicInformationState, pub.getSettings);
export const selectSettingsResponse = createSelector(getPublicInformationState, pub.getSettingsResponse);
export const selectLanguage = createSelector(getPublicInformationState, pub.getLanguage);
export const selectFooterState = createSelector(getPublicInformationState, pub.getFooterState);
export const selectError = createSelector(getPublicInformationState, pub.getError);

// router
const getRouteState = (state: AppState) => state.route;
export const selectRouteState = createSelector(getRouteState, (state) => state.state);

/** ===================================================Auth=================================================== */

// login
const getLoginState = (state: AppState) => state.login;
export const selectUsername = createSelector(getLoginState, login.getUsername);
export const selectLoginResponse = createSelector(getLoginState, login.getLoginResponse);
export const selectNeedGoogleSecondaryVer = createSelector(getLoginState, login.getNeedSecondaryVer);

// singup
const getSignupState = (state: AppState) => state.signup;
export const selectSignupResponse = createSelector(getSignupState, signup.getSingupResponse);
export const selectAgreeState = createSelector(getSignupState, signup.getAgreeState);

// reset password
const getResetPwdState = (state: AppState) => state.reset;
export const selectResetPasswordResponse = createSelector(getResetPwdState, reset.getResetResponse);

// set password
const getSetPwdState = (state: AppState) => state.pwd;
export const selectSetPwdResponse = createSelector(getSetPwdState, pwd.getSetPwdResponse);

// verify password
const getVerifyPwdState = (state: AppState) => state.verifyPwd;
export const selectVerifyPwdResponse = createSelector(getVerifyPwdState, verifyPwd.getVerifyResponse);
export const selectTemporaryPwd = createSelector(getVerifyPwdState, verifyPwd.getTemporaryPwd);

/** ===================================================Exchange=================================================== */

// exchange list
const getExchangeState = (state: AppState) => state.exchange;
export const selectExchangeList = createSelector(getExchangeState, exchange.getExchangeListResponse);
export const selectExchangeResponseState = createSelector(getExchangeState, exchange.getExchangeListResponseState);


/** ===================================================Robot=================================================== */

const getRobotState = (state: AppState) => state.robot;

// robot list
export const selectRobotListResState = createSelector(getRobotState, robot.getRobotListResState);
export const selectRobotListData = createSelector(getRobotState, robot.getRobotData);

// publish robot
export const selectPublicRobotResponse = createSelector(getRobotState, robot.getPublicRobotRes);

// robot detail
export const selectRobotDetailResponse = createSelector(getRobotState, robot.getRobotDetailRes);

// subscribe robot
export const selectSubscribeRobotResponse = createSelector(getRobotState, robot.getSubscribeRobotRes);

// robot logs
export const selectRobotLogsResponse = createSelector(getRobotState, robot.getRobotLogsRes);
export const selectSyncRobotLogsResponse = createSelector(getRobotState, robot.getSyncLogsResponse);

// restart robot
export const selectRestartRobotResponse = createSelector(getRobotState, robot.getRestartRobotRes);

// stop robot
export const selectStopRobotResponse = createSelector(getRobotState, robot.getStopRobotRes);

// local params
export const selectRobotArgs = createSelector(getRobotState, robot.getRobotArgs);
export const selectRobotStrategyArgs = createSelector(selectRobotArgs, state => state ? state.strategyArgs : null);
export const selectRobotTemplateArgs = createSelector(selectRobotArgs, state => state ? state.templateArgs : null);
export const selectRobotCommandArgs = createSelector(selectRobotArgs, state => state ? state.commandArgs : null);

// modify robot config
export const selectModifyRobotResponse = createSelector(getRobotState, robot.getModifyRobotRes);

// command robot
export const selectCommandRobotResponse = createSelector(getRobotState, robot.getCommandRobotRes);

// delete robot
export const selectDeleteRobotResponse = createSelector(getRobotState, robot.getDeleteRobotRes);

// create robot
export const selectSaveRobotResponse = createSelector(getRobotState, robot.getSaveRobotRes);

// plugin run
export const selectPluginRunResponse = createSelector(getRobotState, robot.getPluginRunRes);

// default params
export const selectRobotDefaultParams = createSelector(getRobotState, robot.getDefaultParams);
export const selectRobotDefaultLogParams = createSelector(selectRobotDefaultParams, state => state.robotLogs);
export const selectRobotProfitMaxPoint = createSelector(selectRobotDefaultParams, state => state.PROFIT_MAX_POINTS);
export const selectRobotStrategyMaxPoint = createSelector(selectRobotDefaultParams, state => state.STRATEGY_MAX_POINTS);

// monitoring message type
export const selectRobotLogMonitoringSound = createSelector(getRobotState, robot.getMonitoringSound);

// ui state
export const selectRobotUiState = createSelector(getRobotState, robot.getUIState);
export const selectRobotRunningLogCurrentPage = createSelector(selectRobotUiState, state => state.currentRunningLogPage);
export const selectRobotProfitChartCurrentPage = createSelector(selectRobotUiState, state => state.currentProfitChartPage);
export const selectRobotStrategyChartCurrentPage = createSelector(selectRobotUiState, state => state.currentStrategyChartPage);

// server send robot message
export const selectServerSendRobotMessage = createSelector(getRobotState, robot.getServerSendMessage);

// request parameter
export const selectRobotRequestParameters = createSelector(getRobotState, robot.getRequestParameter);
export const selectRobotLogRequestParameters = createSelector(selectRobotRequestParameters, state => state.robotLogs);

/** ===================================================Node=================================================== */

const getBtNodeState = (state: AppState) => state.btNode;

export const selectBtNodeListResponse = createSelector(getBtNodeState, btNode.getNodeListResponse);

/** ===================================================Platform=================================================== */

const getPlatformState = (state: AppState) => state.platform;

export const selectPlatformListResponse = createSelector(getPlatformState, platform.getPlatformListResponse);

/** ===================================================Watch dog=================================================== */

const getWatchDogState = (state: AppState) => state.watchDog;

export const selectSetWatchDogResponse = createSelector(getWatchDogState, watchDog.getSetWDResponse);
export const selectSetWatchDogRequest = createSelector(getWatchDogState, watchDog.getSetWDRequest);

/** ===================================================Strategy====================================================== */

const getStrategyState = (state: AppState) => state.strategy;

// strategy list
export const selectStrategyListResponse = createSelector(getStrategyState, strategy.getStrategyListRes);

// strategy request params
export const selectStrategyRequestParams = createSelector(getStrategyState, strategy.getRequestParams);

// share strategy
export const selectShareStrategyResponse = createSelector(getStrategyState, strategy.getShareStrategyRes);

// gen key
export const selectGenKeyResponse = createSelector(getStrategyState, strategy.getGenKeyResponse);

// verify gen key
export const selectVerifyKeyResponse = createSelector(getStrategyState, strategy.getVerifyKeyRes);

// delete strategy
export const selectDeleteStrategyResponse = createSelector(getStrategyState, strategy.getDeleteStrategyRes);

// op strategy token
export const selectOpStrategyTokenResponse = createSelector(getStrategyState, strategy.getOpStrategyTokenRes);

/** ===================================================Charge====================================================== */

const getChargeState = (state: AppState) => state.charge;

// payment args
export const selectPaymentArgResponse = createSelector(getChargeState, charge.getPaymentArgRes);

// pay orders
export const selectPayOrdersResponse = createSelector(getChargeState, charge.getPayOrdersRes);

// request parameters
export const selectChargeRequestParams = createSelector(getChargeState, charge.getRequestArgs);
export const selectPaymentArgRequestParams = createSelector(selectChargeRequestParams, state => state && state.paymentArg);

// server send payment message
export const selectServerSendRechargeMessage = createSelector(getChargeState, charge.getServerSendMessage);
