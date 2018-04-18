import { ActionReducerMap, createSelector } from '@ngrx/store';

import * as login from './auth/login.reducer';
import * as pwd from './auth/password.reducer';
import * as reset from './auth/reset.reducer';
import * as signup from './auth/signup.reducer';
import * as exchange from './exchange/exchange.reducer';
import * as pub from './public/public.reducer';
import * as robot from './robot/robot.reducer';

export interface AppState {
    pub: pub.State,
    login: login.State,
    signup: signup.State,
    reset: reset.State,
    pwd: pwd.State,
    exchange: exchange.State,
    robot: robot.State,
}

export const reducers: ActionReducerMap<AppState> = {
    pub: pub.reducer,
    login: login.reducer,
    signup: signup.reducer,
    reset: reset.reducer,
    pwd: pwd.reducer,
    exchange: exchange.reducer,
    robot: robot.reducer,
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

// login
export const getLoginState = (state: AppState) => state.login;
export const selectUsername = createSelector(getLoginState, login.getUsername);
export const selectLoginResponse = createSelector(getLoginState, login.getLoginResponse);

// singup
export const getSignupState = (state: AppState) => state.signup;
export const selectSignupResponse = createSelector(getSignupState, signup.getSingupResponse);
export const selectAgreeState = createSelector(getSignupState, signup.getAgreeState);

// reset password
export const getResetPwdState = (state: AppState) => state.reset;
export const selectResetPasswordResponse = createSelector(getResetPwdState, reset.getResetResponse);

// set password
export const getSetPwdState = (state: AppState) => state.pwd;
export const selectSetPwdResponse = createSelector(getSetPwdState, pwd.getSetPwdResponse);

// exchange list
export const getExchangeState = (state: AppState) => state.exchange;
export const selectExchangeList = createSelector(getExchangeState, exchange.getExchangeListResponse);
export const selectExchangeResponseState = createSelector(getExchangeState, exchange.getExchangeListResponseState);

// robot list 
export const getRobotState = (state: AppState) => state.robot;
export const selectRobotListResState = createSelector(getRobotState, robot.getResponseState);
export const selectRobotListData = createSelector(getRobotState, robot.getRobotData);