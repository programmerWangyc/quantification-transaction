import { Action } from '@ngrx/store';

import { GetNodeListResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Node list===================================

// node list
export class GetNodeListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetNodeList';

    order = null;

    noneParams = true;

    constructor() { super() };
}

export const GET_NODE_LIST = '[Node] GET_NODE_LIST';

export class GetNodeListRequestAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST;

    constructor(public payload = {}, public allowSeparateRequest = false) { super() }
}

export const GET_NODE_LIST_FAIL = '[Node] GET_NODE_LIST_FAIL';

export class GetNodeListFailAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST_FAIL;

    constructor(public payload: GetNodeListResponse) { super() }
}

export const GET_NODE_LIST_SUCCESS = '[Node] GET_NODE_LIST_SUCCESS';

export class GetNodeListSuccessAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST_SUCCESS;

    constructor(public payload: GetNodeListResponse) { super() }
}

//  ===========================================Local action===================================

//  none local action 

export type ApiActions = GetNodeListRequestAction
    | GetNodeListFailAction
    | GetNodeListSuccessAction

export type Actions = ApiActions

export const ResponseActions = {
    GetNodeListFailAction,
    GetNodeListSuccessAction,
}
