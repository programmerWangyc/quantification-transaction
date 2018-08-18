import { Action } from '@ngrx/store';

import { GetBBSPlaneListRequest, GetBBSNodeListRequest, GetBBSTopicListBySlugRequest, GetBBSTopicRequest, AddBBSTopicRequest, GetQiniuTokenRequest } from '../../interfaces/request.interface';
import { GetBBSNodeListResponse, GetBBSTopicListBySlugResponse, GetBBSPlaneListResponse, GetBBSTopicResponse, AddBBSTopicResponse, GetQiniuTokenResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

// Get bbs plane list
class GetBBSPlaneList extends ApiAction {
    isSingleParams = false;

    command = 'GetBBSPlaneList';

    order = null;

    noneParams = true;
}

export const GET_BBS_PLANE_LIST = '[BBS] GET_BBS_PLANE_LIST';

export class GetBBSPlaneListRequestAction extends GetBBSPlaneList implements Action {
    readonly type = GET_BBS_PLANE_LIST;

    constructor(public payload: GetBBSPlaneListRequest = null) { super(); }
}

export const GET_BBS_PLANE_LIST_FAIL = '[BBS] GET_BBS_PLANE_LIST_FAIL';

export class GetBBSPlaneListFailAction extends GetBBSPlaneList implements Action {
    readonly type = GET_BBS_PLANE_LIST_FAIL;

    constructor(public payload: GetBBSPlaneListResponse) { super(); }
}

export const GET_BBS_PLANE_LIST_SUCCESS = '[BBS] GET_BBS_PLANE_LIST_SUCCESS';

export class GetBBSPlaneListSuccessAction extends GetBBSPlaneList implements Action {
    readonly type = GET_BBS_PLANE_LIST_SUCCESS;

    constructor(public payload: GetBBSPlaneListResponse) { super(); }
}

// bbs node list
class GetBBSNodeList extends ApiAction {
    isSingleParams = false;

    command = 'GetBBSNodeList';

    order = null;

    noneParams = true;
}

export const GET_BBS_NODE_LIST = '[BBS] GET_BBS_NODE_LIST';

export class GetBBSNodeListRequestAction extends GetBBSNodeList implements Action {
    readonly type = GET_BBS_NODE_LIST;

    constructor(public payload: GetBBSNodeListRequest = null) { super(); }
}

export const GET_BBS_NODE_LIST_FAIL = '[BBS] GET_BBS_NODE_LIST_FAIL';

export class GetBBSNodeListFailAction extends GetBBSNodeList implements Action {
    readonly type = GET_BBS_NODE_LIST_FAIL;

    constructor(public payload: GetBBSNodeListResponse) { super(); }
}

export const GET_BBS_NODE_LIST_SUCCESS = '[BBS] GET_BBS_NODE_LIST_SUCCESS';

export class GetBBSNodeListSuccessAction extends GetBBSNodeList implements Action {
    readonly type = GET_BBS_NODE_LIST_SUCCESS;

    constructor(public payload: GetBBSNodeListResponse) { super(); }
}

// bbs topic list
enum BBSTopicListBySlugOrder {
    slug,
    offset,
    limit,
    keyword,
    length,
}

class GetBBSTopicListBySlug extends ApiAction {
    isSingleParams = false;

    command = 'GetBBSTopicListBySlug';

    order = BBSTopicListBySlugOrder;

    noneParams = false;
}

export const GET_BBS_TOPIC_LIST_BY_SLUG = '[BBS] GET_BBS_TOPIC_LIST_BY_SLUG';

export class GetBBSTopicListBySlugRequestAction extends GetBBSTopicListBySlug implements Action {
    readonly type = GET_BBS_TOPIC_LIST_BY_SLUG;

    constructor(public payload: GetBBSTopicListBySlugRequest) { super(); }
}

export const GET_BBS_TOPIC_LIST_BY_SLUG_FAIL = '[BBS] GET_BBS_TOPIC_LIST_BY_SLUG_FAIL';

export class GetBBSTopicListBySlugFailAction extends GetBBSTopicListBySlug implements Action {
    readonly type = GET_BBS_TOPIC_LIST_BY_SLUG_FAIL;

    constructor(public payload: GetBBSTopicListBySlugResponse) { super(); }
}

export const GET_BBS_TOPIC_LIST_BY_SLUG_SUCCESS = '[BBS] GET_BBS_TOPIC_LIST_BY_SLUG_SUCCESS';

export class GetBBSTopicListBySlugSuccessAction extends GetBBSTopicListBySlug implements Action {
    readonly type = GET_BBS_TOPIC_LIST_BY_SLUG_SUCCESS;

    constructor(public payload: GetBBSTopicListBySlugResponse) { super(); }
}

// bbs topic by id
class GetBBSTopic extends ApiAction {
    isSingleParams = true;

    command = 'GetBBSTopic';

    noneParams = false;

    order = null;
}

export const GET_BBS_TOPIC_BY_ID = '[BBS] GET_BBS_TOPIC_BY_ID';

export class GetBBSTopicRequestAction extends GetBBSTopic implements Action {
    readonly type = GET_BBS_TOPIC_BY_ID;

    constructor(public payload: GetBBSTopicRequest) { super(); }
}

export const GET_BBS_TOPIC_BY_ID_FAIL = '[BBS] GET_BBS_TOPIC_BY_ID_FAIL';

export class GetBBSTopicFailAction extends GetBBSTopic implements Action {
    readonly type = GET_BBS_TOPIC_BY_ID_FAIL;

    constructor(public payload: GetBBSTopicResponse) { super(); }
}

export const GET_BBS_TOPIC_BY_ID_SUCCESS = '[BBS] GET_BBS_TOPIC_BY_ID_SUCCESS';

export class GetBBSTopicSuccessAction extends GetBBSTopic implements Action {
    readonly type = GET_BBS_TOPIC_BY_ID_SUCCESS;

    constructor(public payload: GetBBSTopicResponse) { super(); }
}

// add bbs topic
enum AddBBSTopicOrder {
    id,
    nodeId,
    title,
    content,
    length,
}

class AddBBSTopic extends ApiAction {
    isSingleParams = false;

    command = 'AddBBSTopic';

    noneParams = false;

    order = AddBBSTopicOrder;
}

export const ADD_BBS_TOPIC = '[BBS] ADD_BBS_TOPIC';

export class AddBBSTopicRequestAction extends AddBBSTopic implements Action {
    readonly type = ADD_BBS_TOPIC;

    constructor(public payload: AddBBSTopicRequest) { super(); }
}

export const ADD_BBS_TOPIC_FAIL = '[BBS] ADD_BBS_TOPIC_FAIL';

export class AddBBSTopicFailAction extends AddBBSTopic implements Action {
    readonly type = ADD_BBS_TOPIC_FAIL;

    constructor(public payload: AddBBSTopicResponse) { super(); }
}

export const ADD_BBS_TOPIC_SUCCESS = '[BBS] ADD_BBS_TOPIC_SUCCESS';

export class AddBBSTopicSuccessAction extends AddBBSTopic implements Action {
    readonly type = ADD_BBS_TOPIC_SUCCESS;

    constructor(public payload: AddBBSTopicResponse) { super(); }
}

// qi niu token
class GetQiniuToken extends ApiAction {
    isSingleParams = true;

    command = 'GetQiniuToken';

    noneParams = false;

    order = null;

    callbackId = 'GetBBSQiniuToken';
}

export const GET_QINIU_TOKEN = '[BBS] GET_QINIU_TOKEN';

export class GetBBSQiniuTokenRequestAction extends GetQiniuToken implements Action {
    readonly type = GET_QINIU_TOKEN;

    constructor(public payload: GetQiniuTokenRequest) { super(); }
}

export const GET_QINIU_TOKEN_FAIL = '[BBS] GET_QINIU_TOKEN_FAIL';

export class GetBBSQiniuTokenFailAction extends GetQiniuToken implements Action {
    readonly type = GET_QINIU_TOKEN_FAIL;

    constructor(public payload: GetQiniuTokenResponse) { super(); }
}

export const GET_QINIU_TOKEN_SUCCESS = '[BBS] GET_QINIU_TOKEN_SUCCESS';

export class GetBBSQiniuTokenSuccessAction extends GetQiniuToken implements Action {
    readonly type = GET_QINIU_TOKEN_SUCCESS;

    constructor(public payload: GetQiniuTokenResponse) { super(); }
}

//  ===========================================Local action===================================

export const RESET_BBS_TOPIC = '[BBS] RESET_BBS_TOPIC';

export class ResetBBSTopicAction implements Action {
    readonly type = RESET_BBS_TOPIC;
}

export const CLEAR_QINIU_TOKEN = '[BBS] CLEAR_QINIU_TOKEN';

export class ClearQiniuTokenAction implements Action {
    readonly type = CLEAR_QINIU_TOKEN;
}

export const CLEAR_BBS_OPERATE_STATE = '[BBS] CLEAR_BBS_OPERATE_STATE';

export class ClearBBSOperateStateAction implements Action {
    readonly type = CLEAR_BBS_OPERATE_STATE;
}

export type ApiActions = GetBBSPlaneListRequestAction
    | AddBBSTopicFailAction
    | AddBBSTopicRequestAction
    | AddBBSTopicSuccessAction
    | GetBBSNodeListFailAction
    | GetBBSNodeListRequestAction
    | GetBBSNodeListSuccessAction
    | GetBBSPlaneListFailAction
    | GetBBSPlaneListSuccessAction
    | GetBBSTopicFailAction
    | GetBBSTopicListBySlugFailAction
    | GetBBSTopicListBySlugRequestAction
    | GetBBSTopicListBySlugSuccessAction
    | GetBBSTopicRequestAction
    | GetBBSTopicSuccessAction
    | GetBBSQiniuTokenFailAction
    | GetBBSQiniuTokenRequestAction
    | GetBBSQiniuTokenSuccessAction;

export type Actions = ApiActions
    | ResetBBSTopicAction
    | ClearBBSOperateStateAction
    | ClearQiniuTokenAction;

export const ResponseActions = {
    AddBBSTopicFailAction,
    AddBBSTopicSuccessAction,
    GetBBSNodeListFailAction,
    GetBBSNodeListSuccessAction,
    GetBBSPlaneListFailAction,
    GetBBSPlaneListSuccessAction,
    GetBBSTopicFailAction,
    GetBBSTopicListBySlugFailAction,
    GetBBSTopicListBySlugSuccessAction,
    GetBBSTopicSuccessAction,
    GetBBSQiniuTokenFailAction,
    GetBBSQiniuTokenRequestAction,
    GetBBSQiniuTokenSuccessAction,
};
