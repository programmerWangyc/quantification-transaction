import { Action } from '@ngrx/store';

import { Referrer } from '../../interfaces/business.interface';
import { PublicResponse, SettingsResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { SettingsRequest } from './../../interfaces/request.interface';

/* ===========================================Api action=================================== */

// public 
export const SET_PUBLIC_INFORMATION = 'SET_PUBLIC_INFORMATION';

export class SetPublicInformationAction implements Action {
    readonly type = SET_PUBLIC_INFORMATION;

    constructor(public payload: PublicResponse) { }
}

export const SET_REFERRER = 'SET_REFERRER';

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

export const GET_SETTINGS = 'GET_SETTINGS';

export class GetSettingsRequestAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS;

    constructor(public payload: SettingsRequest, public allowSeparateRequest = true) { super() }
}

export const GET_SETTINGS_FAIL = 'GET_SETTINGS_FAIL';

export class GetSettingsFailAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS_FAIL;

    constructor(public payload: SettingsResponse) { super() }
}

export const GET_SETTINGS_SUCCESS = 'GET_SETTINGS_SUCCESS';

export class GetSettingsSuccessAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS_SUCCESS;

    constructor(public payload: SettingsResponse) { super() }
}

/* ===========================================Local action=================================== */

export const SET_LANGUAGE = 'SET_LANGUAGE';

export class SetLanguageAction implements Action {
    readonly type = SET_LANGUAGE;

    constructor(public payload: string) { }
}

export const TOGGLE_FOOTER = 'TOGGLE_FOOTER';

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