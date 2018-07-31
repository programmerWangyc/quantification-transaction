import { Action } from '@ngrx/store';

import { GetPlatformListResponse, DeletePlatformResponse, GetPlatformDetailResponse, SavePlatformResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { DeletePlatformRequest, GetPlatformDetailRequest, SavePlatformRequest } from '../../interfaces/request.interface';

//  ===========================================Api action===================================

// platform list
export class GetPlatformListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetPlatformList';

    order = null;

    noneParams = true;

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const GET_PLATFORM_LIST = '[Platform] GET_PLATFORM_LIST';

export class GetPlatformListRequestAction extends GetPlatformListAction implements Action {
    readonly type = GET_PLATFORM_LIST;

    constructor(public payload = {}) { super(); }
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

// platform detail
class GetPlatformDetailAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    order = null;

    allowSeparateRequest = true;

    command = 'GetPlatformDetail';

    constructor() { super(); }
}

export const GET_PLATFORM_DETAIL = '[Platform] GET_PLATFORM_DETAIL';

export class GetPlatformDetailRequestAction extends GetPlatformDetailAction implements Action {
    readonly type = GET_PLATFORM_DETAIL;

    constructor(public payload: GetPlatformDetailRequest) { super(); }
}

export const GET_PLATFORM_DETAIL_FAIL = '[Platform] GET_PLATFORM_DETAIL_FAIL';

export class GetPlatformDetailFailAction extends GetPlatformDetailAction implements Action {
    readonly type = GET_PLATFORM_DETAIL_FAIL;

    constructor(public payload: GetPlatformDetailResponse) { super(); }
}

export const GET_PLATFORM_DETAIL_SUCCESS = '[Platform] GET_PLATFORM_DETAIL_SUCCESS';

export class GetPlatformDetailSuccessAction extends GetPlatformDetailAction implements Action {
    readonly type = GET_PLATFORM_DETAIL_SUCCESS;

    constructor(public payload: GetPlatformDetailResponse) { super(); }
}

// update platform

enum SavePlatformOrder {
    id,
    exchangeId,
    config,
    reserved,
    flag,
    length,
}

class SavePlatformAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = SavePlatformOrder;

    command = 'SavePlatform';

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const SAVE_PLATFORM = '[Platform] SAVE_PLATFORM';

export class SavePlatformRequestAction extends SavePlatformAction implements Action {
    readonly type = SAVE_PLATFORM;

    constructor(public payload: SavePlatformRequest) { super(); }
}

export const SAVE_PLATFORM_FAIL = '[Platform] SAVE_PLATFORM_FAIL';

export class SavePlatformFailAction extends SavePlatformAction implements Action {
    readonly type = SAVE_PLATFORM_FAIL;

    constructor(public payload: SavePlatformResponse) { super(); }
}

export const SAVE_PLATFORM_SUCCESS = '[Platform] SAVE_PLATFORM_SUCCESS';

export class SavePlatformSuccessAction extends SavePlatformAction implements Action {
    readonly type = SAVE_PLATFORM_SUCCESS;

    constructor(public payload: SavePlatformResponse) { super(); }
}

export const RESET_STATE = '[Platform] RESET_STATE';

export class ResetStateAction implements Action {
    readonly type = RESET_STATE;
}


//  ===========================================Local action===================================

//  none local action

export type ApiActions = GetPlatformListRequestAction
    | DeletePlatformFailAction
    | DeletePlatformRequestAction
    | DeletePlatformSuccessAction
    | GetPlatformDetailFailAction
    | GetPlatformDetailRequestAction
    | GetPlatformDetailSuccessAction
    | GetPlatformListFailAction
    | GetPlatformListSuccessAction
    | SavePlatformFailAction
    | SavePlatformRequestAction
    | SavePlatformSuccessAction;

export type Actions = ApiActions
    | ResetStateAction;

export const ResponseActions = {
    DeletePlatformFailAction,
    DeletePlatformSuccessAction,
    GetPlatformDetailFailAction,
    GetPlatformDetailSuccessAction,
    GetPlatformListFailAction,
    GetPlatformListSuccessAction,
    SavePlatformFailAction,
    SavePlatformSuccessAction,
};
