import { Action } from '@ngrx/store';

import { ApiAction } from '../base.action';
import { GetPlatformListResponse } from './../../interfaces/response.interface';

/* ===========================================Api action=================================== */

// platform list
export class GetPlatformListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetPlatformList';

    order = null;

    noneParams = true;

    constructor() { super() };
}

export const GET_PLATFORM_LIST = 'GET_PLATFORM_LIST';

export class GetPlatformListRequestAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST;

    allowSeparateRequest = false;

    constructor(public payload = {}) { super() }
}

export const GET_PLATFORM_LIST_FAIL = 'GET_PLATFORM_LIST_FAIL';

export class GetPlatformListFailAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST_FAIL;

    constructor(public payload: GetPlatformListResponse) { super() }
}

export const GET_PLATFORM_LIST_SUCCESS = 'GET_PLATFORM_LIST_SUCCESS';

export class GetPlatformListSuccessAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST_SUCCESS;

    constructor(public payload: GetPlatformListResponse) { super() }
}

/* ===========================================Local action=================================== */

/* none local action */

export type ApiActions = GetPlatformListRequestAction
    | GetPlatformListFailAction
    | GetPlatformListSuccessAction

export type Actions = ApiActions

export const ResponseActions = {
    GetPlatformListFailAction,
    GetPlatformListSuccessAction,
}