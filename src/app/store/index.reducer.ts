import { ActionReducerMap, createSelector } from '@ngrx/store';

import * as login from './auth/login.reducer';
import * as reset from './auth/reset.reducer';
import * as signup from './auth/signup.reducer';
import * as pub from './public/public.reducer';
import * as pwd from './auth/password.reducer';

export interface AppState {
    pub: pub.State,
    login: login.State,
    signup: signup.State,
    reset: reset.State,
    pwd: pwd.State,
}

export const reducers: ActionReducerMap<AppState> = {
    pub: pub.reducer,
    login: login.reducer,
    signup: signup.reducer,
    reset: reset.reducer,
    pwd: pwd.reducer,
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
