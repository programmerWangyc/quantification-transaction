import { Action } from '@ngrx/store';

import { GetPlatformListResponse, DeletePlatformResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { DeletePlatformRequest } from '../../interfaces/request.interface';

//  ===========================================Api action===================================

// platform list
export class GetPlatformListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetPlatformList';

    order = null;

    noneParams = true;

    constructor() { super(); }
}

export const GET_PLATFORM_LIST = '[Platform] GET_PLATFORM_LIST';

export class GetPlatformListRequestAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST;

    constructor(public payload = {}, public allowSeparateRequest = false) {
        super();
        this.allowSeparateRequest = allowSeparateRequest;
    }
}

export const GET_PLATFORM_LIST_FAIL = '[Platform] GET_PLATFORM_LIST_FAIL';

export class GetPlatformListFailAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST_FAIL;

    constructor(public payload: GetPlatformListResponse) { super(); }
}

export const GET_PLATFORM_LIST_SUCCESS = '[Platform] GET_PLATFORM_LIST_SUCCESS';

export class GetPlatformListSuccessAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST_SUCCESS;

    constructor(public payload: GetPlatformListResponse) { super(); }
}

// delete platform
class DeletePlatformAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    order = null;

    command = 'DeletePlatform';

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const DELETE_PLATFORM = '[Platform] DELETE_PLATFORM';

export class DeletePlatformRequestAction extends DeletePlatformAction implements Action {
    readonly type = DELETE_PLATFORM;

    constructor(public payload: DeletePlatformRequest) { super(); }
}

export const DELETE_PLATFORM_FAIL = '[Platform] DELETE_PLATFORM_FAIL';

export class DeletePlatformFailAction extends DeletePlatformAction implements Action {
    readonly type = DELETE_PLATFORM_FAIL;

    constructor(public payload: DeletePlatformResponse) { super(); }
}

export const DELETE_PLATFORM_SUCCESS = '[Platform] DELETE_PLATFORM_SUCCESS';

export class DeletePlatformSuccessAction extends DeletePlatformAction implements Action {
    readonly type = DELETE_PLATFORM_SUCCESS;

    constructor(public payload: DeletePlatformResponse) { super(); }
}

//  ===========================================Local action===================================

//  none local action

export type ApiActions = GetPlatformListRequestAction
    | GetPlatformListFailAction
    | GetPlatformListSuccessAction
    | DeletePlatformRequestAction
    | DeletePlatformFailAction
    | DeletePlatformSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    GetPlatformListFailAction,
    GetPlatformListSuccessAction,
    DeletePlatformFailAction,
    DeletePlatformSuccessAction,
};
