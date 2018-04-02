import { Action } from '@ngrx/store';

import { Referrer } from '../../interfaces/business.interface';
import { PublicResponse, SettingsResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { SettingsRequest } from './../../interfaces/request.interface';

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

    constructor() { super() }
}

export const GET_SETTINGS = 'GET_SETTINGS';

export class GetSettingsRequestAction extends SettingsAction implements Action {
    readonly type = GET_SETTINGS;

    constructor(public payload: SettingsRequest) { super() }
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

export type ApiActions = GetSettingsRequestAction
    | GetSettingsFailAction
    | GetSettingsSuccessAction

export type Actions = ApiActions
    | SetPublicInformationAction
    | SetReferrerAction
