import { Action } from '@ngrx/store';

import { Referrer } from '../../interfaces/constant.interface';
import { PublicResponse, SettingsResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { SettingsRequest } from './../../interfaces/request.interface';

/* ===========================================Api action=================================== */

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

    constructor() { super() }
}

export const GET_SETTINGS = '[Public] GET_SETTINGS';

export class GetSettingsRequestAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS;

    constructor(public payload: SettingsRequest, public allowSeparateRequest = true) { super() }
}

export const GET_SETTINGS_FAIL = '[Public] GET_SETTINGS_FAIL';

export class GetSettingsFailAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS_FAIL;

    constructor(public payload: SettingsResponse) { super() }
}

export const GET_SETTINGS_SUCCESS = '[Public] GET_SETTINGS_SUCCESS';

export class GetSettingsSuccessAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS_SUCCESS;

    constructor(public payload: SettingsResponse) { super() }
}

/* ===========================================Local action=================================== */

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
export type ApiActions = GetSettingsRequestAction
    | GetSettingsFailAction
    | GetSettingsSuccessAction

export type Actions = ApiActions
    | SetPublicInformationAction
    | SetReferrerAction
    | SetLanguageAction
    | ToggleFooterAction

export const ResponseActions = {
    GetSettingsFailAction,
    GetSettingsSuccessAction,
}
