import { Action } from '@ngrx/store';

import { DeleteNodeRequest, GetNodeHashRequest } from '../../interfaces/request.interface';
import { DeleteNodeResponse, GetNodeListResponse, GetNodeHashResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================API request===================================

// node list
class GetNodeListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetNodeList';

    order = null;

    noneParams = true;

    constructor() { super(); }
}

export const GET_NODE_LIST = '[Node] GET_NODE_LIST';

export class GetNodeListRequestAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST;

    constructor(public payload = {}, public allowSeparateRequest = false) { super(); }
}

export const GET_NODE_LIST_FAIL = '[Node] GET_NODE_LIST_FAIL';

export class GetNodeListFailAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST_FAIL;

    constructor(public payload: GetNodeListResponse) { super(); }
}

export const GET_NODE_LIST_SUCCESS = '[Node] GET_NODE_LIST_SUCCESS';

export class GetNodeListSuccessAction extends GetNodeListAction implements Action {
    readonly type = GET_NODE_LIST_SUCCESS;

    constructor(public payload: GetNodeListResponse) { super(); }
}

// delete node
class DeleteNodeAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'DeleteNode';

    order = null;

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const DELETE_NODE = '[Node] DELETE_NODE';

export class DeleteNodeRequestAction extends DeleteNodeAction {
    readonly type = DELETE_NODE;

    constructor(public payload: DeleteNodeRequest) { super(); }
}

export const DELETE_NODE_FAIL_ACTION = '[Node] DELETE_NODE_FAIL_ACTION';

export class DeleteNodeFailAction extends DeleteNodeAction {
    readonly type = DELETE_NODE_FAIL_ACTION;

    constructor(public payload: DeleteNodeResponse) { super(); }
}

export const DELETE_NODE_SUCCESS_ACTION = '[Node] DELETE_NODE_SUCCESS_ACTION';

export class DeleteNodeSuccessAction extends DeleteNodeAction {
    readonly type = DELETE_NODE_SUCCESS_ACTION;

    constructor(public payload: DeleteNodeResponse) { super(); }
}

// node hash
class GetNodeHashAction extends ApiAction {
    isSingleParams = false;

    noneParams = true;

    command = 'GetNodeHash';

    order = null;

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const GET_NODE_HASH = '[Node] GET_NODE_HASH';

export class GetNodeHashRequestAction extends GetNodeHashAction {
    readonly type = GET_NODE_HASH;

    constructor(public payload: GetNodeHashRequest) { super(); }
}

export const GET_NODE_HASH_FAIL = '[Node] GET_NODE_HASH_FAIL';

export class GetNodeHashFailAction extends GetNodeHashAction {
    readonly type = GET_NODE_HASH_FAIL;

    constructor(public payload: GetNodeHashResponse) { super(); }
}

export const GET_NODE_HASH_SUCCESS = '[Node] GET_NODE_HASH_SUCCESS';

export class GetNodeHashSuccessAction extends GetNodeHashAction {
    readonly type = GET_NODE_HASH_SUCCESS;

    constructor(public payload: GetNodeHashResponse) { super(); }
}


//  ===========================================Local action===================================

//  none local action

export type ApiActions = GetNodeListRequestAction
    | GetNodeListFailAction
    | GetNodeListSuccessAction
    | DeleteNodeRequestAction
    | DeleteNodeFailAction
    | DeleteNodeSuccessAction
    | GetNodeHashRequestAction
    | GetNodeHashFailAction
    | GetNodeHashSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    GetNodeListFailAction,
    GetNodeListSuccessAction,
    DeleteNodeFailAction,
    DeleteNodeSuccessAction,
    GetNodeHashFailAction,
    GetNodeHashSuccessAction,
};
