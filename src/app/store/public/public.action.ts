import { Action } from '@ngrx/store';

import { EditorConfig, Referrer } from '../../interfaces/app.interface';
import { ChangeAlertThresholdSettingRequest, LogoutRequest, SettingsRequest } from '../../interfaces/request.interface';
import {
    ChangeAlertThresholdSettingResponse, LogoutResponse, PublicResponse, SettingsResponse
} from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

// public
export const SET_PUBLIC_INFORMATION = '[Public] SET_PUBLIC_INFORMATION';

export class SetPublicInformationAction implements Action {
    readonly type = SET_PUBLIC_INFORMATION;

    constructor(public payload: PublicResponse) { }
}

export const SET_REFERRER = '[Public] SET_REFERRER';

export class SetReferrerAction implements Action {
    readonly type = SET_REFERRER;

    constructor(public payload: Referrer) { }
}

// settings
export class SettingsAction extends ApiAction {
    isSingleParams = true;

    command = 'GetSettings';

    order = null;

    noneParams = false;

    constructor() { super(); }
}

export const GET_SETTINGS = '[Public] GET_SETTINGS';

export class GetSettingsRequestAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS;

    constructor(public payload: SettingsRequest) { super(); }
}

export const GET_SETTINGS_FAIL = '[Public] GET_SETTINGS_FAIL';

export class GetSettingsFailAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS_FAIL;

    constructor(public payload: SettingsResponse) { super(); }
}

export const GET_SETTINGS_SUCCESS = '[Public] GET_SETTINGS_SUCCESS';

export class GetSettingsSuccessAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS_SUCCESS;

    constructor(public payload: SettingsResponse) { super(); }
}

// change alert threshold
enum AlertThresholdOrder {
    type,
    amount,
    length,
}

export class AlertThreshold extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = AlertThresholdOrder;

    command = 'ChangeSettings';

    callbackId = 'ChangeAlertThresholdSetting';
}

export const CHANGE_ALERT_THRESHOLD_SETTING = '[Public] CHANGE_ALERT_THRESHOLD_SETTING';

export class ChangeAlertThresholdSettingRequestAction extends AlertThreshold implements Action {
    readonly type = CHANGE_ALERT_THRESHOLD_SETTING;

    constructor(public payload: ChangeAlertThresholdSettingRequest) { super(); }
}

export const CHANGE_ALERT_THRESHOLD_SETTING_FAIL = '[Public] CHANGE_ALERT_THRESHOLD_SETTING_FAIL';

export class ChangeAlertThresholdSettingFailAction extends AlertThreshold implements Action {
    readonly type = CHANGE_ALERT_THRESHOLD_SETTING_FAIL;

    constructor(public payload: ChangeAlertThresholdSettingResponse) { super(); }
}

export const CHANGE_ALERT_THRESHOLD_SETTING_SUCCESS = '[Public] CHANGE_ALERT_THRESHOLD_SETTING_SUCCESS';

export class ChangeAlertThresholdSettingSuccessAction extends AlertThreshold implements Action {
    readonly type = CHANGE_ALERT_THRESHOLD_SETTING_SUCCESS;

    constructor(public payload: ChangeAlertThresholdSettingResponse) { super(); }
}

// logout
export class Logout extends ApiAction {
    isSingleParams = false;

    command = 'Logout';

    order = null;

    noneParams = true;
}

export const LOGOUT = '[Public] LOGOUT';

export class LogoutRequestAction extends Logout implements Action {
    readonly type = LOGOUT;

    constructor(public payload: LogoutRequest) { super(); }
}

export const LOGOUT_FAIL = '[Public] LOGOUT_FAIL';

export class LogoutFailAction extends Logout implements Action {
    readonly type = LOGOUT_FAIL;

    constructor(public payload: LogoutResponse) { super(); }
}

export const LOGOUT_SUCCESS = '[Public] LOGOUT_SUCCESS';

export class LogoutSuccessAction extends Logout implements Action {
    readonly type = LOGOUT_SUCCESS;

    constructor(public payload: LogoutResponse) { super(); }
}

//  ===========================================Local action===================================

export const SET_LANGUAGE = '[Public] SET_LANGUAGE';

export class SetLanguageAction implements Action {
    readonly type = SET_LANGUAGE;

    constructor(public payload: string) { }
}

export const TOGGLE_FOOTER = '[Public] TOGGLE_FOOTER';

export class ToggleFooterAction implements Action {
    readonly type = TOGGLE_FOOTER;

    constructor() { }
}

export const UPDATE_FAVORITE_EDITOR_CONFIG = '[Public] UPDATE_FAVORITE_EDITOR_CONFIG';

export class UpdateFavoriteEditorConfigAction implements Action {
    readonly type = UPDATE_FAVORITE_EDITOR_CONFIG;

    constructor(public payload: EditorConfig) { }
}

export const TOGGLE_SUBSCRIBE_SERVER_SEND_MESSAGE_TYPE = '[Public] TOGGLE_SUBSCRIBE_SERVER_SEND_MESSAGE_TYPE';

export class ToggleSubscribeServerSendMessageTypeAction implements Action {
    readonly type = TOGGLE_SUBSCRIBE_SERVER_SEND_MESSAGE_TYPE;

    constructor(public payload: { message: string; status?: boolean }) { }
}

export const RESET_LOGOUT_RESPONSE = '[Public] RESET_LOGOUT_RESPONSE';

export class ResetLogoutResponseAction implements Action {
    readonly type = RESET_LOGOUT_RESPONSE;
}

export type ApiActions = GetSettingsRequestAction
    | ChangeAlertThresholdSettingFailAction
    | ChangeAlertThresholdSettingRequestAction
    | ChangeAlertThresholdSettingSuccessAction
    | GetSettingsFailAction
    | GetSettingsSuccessAction
    | LogoutFailAction
    | LogoutRequestAction
    | LogoutSuccessAction;

export type Actions = ApiActions
    | ResetLogoutResponseAction
    | SetLanguageAction
    | SetPublicInformationAction
    | SetReferrerAction
    | ToggleFooterAction
    | ToggleSubscribeServerSendMessageTypeAction
    | UpdateFavoriteEditorConfigAction;

export const ResponseActions = {
    ChangeAlertThresholdSettingFailAction,
    ChangeAlertThresholdSettingSuccessAction,
    GetSettingsFailAction,
    GetSettingsSuccessAction,
    LogoutFailAction,
    LogoutSuccessAction,
};
