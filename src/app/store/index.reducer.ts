import { ActionReducerMap, createSelector } from '@ngrx/store';

import * as login from './auth/login.reducer';
import * as pwd from './auth/password.reducer';
import * as reset from './auth/reset.reducer';
import * as signup from './auth/signup.reducer';
import * as verifyPwd from './auth/verify-password.reducer';
import * as btNode from './bt-node/bt-node.reducer';
import * as exchange from './exchange/exchange.reducer';
import * as platform from './platform/platform.reducer';
import * as pub from './public/public.reducer';
import * as robot from './robot/robot.reducer';
import * as watchDog from './watch-dog/watch-dog.reducer';

export interface AppState {
    pub: pub.State,
    login: login.State,
    signup: signup.State,
    reset: reset.State,
    pwd: pwd.State,
    exchange: exchange.State,
    robot: robot.State,
    btNode: btNode.State,
    platform: platform.State,
    verifyPwd: verifyPwd.State,
    watchDog: watchDog.State,
}

export const reducers: ActionReducerMap<AppState> = {
    pub: pub.reducer,
    login: login.reducer,
    signup: signup.reducer,
    reset: reset.reducer,
    pwd: pwd.reducer,
    exchange: exchange.reducer,
    robot: robot.reducer,
    btNode: btNode.reducer,
    platform: platform.reducer,
    verifyPwd: verifyPwd.reducer,
    watchDog: watchDog.reducer,
}


//public information
export const getPublicInformationState = (state: AppState) => state.pub;
export const selectUsernameFromPublic = createSelector(getPublicInformationState, pub.getUsername);
export const selectToken = createSelector(getPublicInformationState, pub.getToken);
export const selectBalance = createSelector(getPublicInformationState, pub.getBalance);
export const selectVersion = createSelector(getPublicInformationState, pub.getVersion);
export const selectIsAdmin = createSelector(getPublicInformationState, pub.getIsAdmin);
export const selectReferrer = createSelector(getPublicInformationState, pub.getReferrer);
export const selectSettings = createSelector(getPublicInformationState, pub.getSettings);
export const selectSettingsResponse = createSelector(getPublicInformationState, pub.getSettingsResponse);
export const selectLanguage = createSelector(getPublicInformationState, pub.getLanguage);
export const selectFooterState = createSelector(getPublicInformationState, pub.getFooterState);
export const selectError = createSelector(getPublicInformationState, pub.getError);

/** ===================================================Auth=================================================== */

// login
const getLoginState = (state: AppState) => state.login;
export const selectUsername = createSelector(getLoginState, login.getUsername);
export const selectLoginResponse = createSelector(getLoginState, login.getLoginResponse);

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

// operate loading state
export const selectRobotOperationLoadingState = createSelector(getRobotState, robot.getLoadingState);

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

/** ===================================================Node=================================================== */

const getBtNodeState = (state: AppState) => state.btNode;

export const selectBtNodeListResponse = createSelector(getBtNodeState, btNode.getNodeListResponse);

/** ===================================================Platform=================================================== */

const getPlatformState = (state: AppState) => state.platform;

export const selectPlatformListResponse = createSelector(getPlatformState, platform.getPlatformListResponse);

/** ===================================================Watch dog=================================================== */

const getWatchDogState = (state: AppState) => state.watchDog;

export const selectSetWatchDogResponse = createSelector(getWatchDogState, watchDog.getSetWDResponse);