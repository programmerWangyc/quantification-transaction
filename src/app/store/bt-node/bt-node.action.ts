import { Action } from '@ngrx/store';

import { ApiAction } from '../base.action';
import { GetNodeListResponse } from './../../interfaces/response.interface';

/* ===========================================Node list=================================== */

// node list
export class GetNodeListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetNodeList';

    order = null;

    noneParams = true;

    constructor() { super() };
}

export const GET_NODE_LIST = 'GET_NODE_LIST';

export class GetNodeListRequestAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST;

    allowSeparateRequest = false;

    constructor(public payload = {}) { super() }
}

export const GET_NODE_LIST_FAIL = 'GET_NODE_LIST_FAIL';

export class GetNodeListFailAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST_FAIL;

    constructor(public payload: GetNodeListResponse) { super() }
}

export const GET_NODE_LIST_SUCCESS = 'GET_NODE_LIST_SUCCESS';

export class GetNodeListSuccessAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST_SUCCESS;

    constructor(public payload: GetNodeListResponse) { super() }
}

/* ===========================================Local action=================================== */

/* none local action */

export type ApiActions = GetNodeListRequestAction
    | GetNodeListFailAction
    | GetNodeListSuccessAction

export type Actions = ApiActions

export const ResponseActions = {
    GetNodeListFailAction,
    GetNodeListSuccessAction,
}