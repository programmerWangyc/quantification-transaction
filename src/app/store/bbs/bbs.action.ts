import { Action } from '@ngrx/store';

import { GetBBSPlaneListRequest, GetBBSNodeListRequest, GetBBSTopicListBySlugRequest } from '../../interfaces/request.interface';
import { GetBBSNodeListResponse, GetBBSTopicListBySlugResponse, GetBBSPlaneListResponse } from '../../interfaces/response.interface';
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
//  ===========================================Local action===================================

export type ApiActions = GetBBSPlaneListRequestAction
    | GetBBSNodeListFailAction
    | GetBBSNodeListRequestAction
    | GetBBSNodeListSuccessAction
    | GetBBSPlaneListFailAction
    | GetBBSPlaneListSuccessAction
    | GetBBSTopicListBySlugFailAction
    | GetBBSTopicListBySlugRequestAction
    | GetBBSTopicListBySlugSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    GetBBSNodeListFailAction,
    GetBBSNodeListSuccessAction,
    GetBBSPlaneListFailAction,
    GetBBSPlaneListSuccessAction,
    GetBBSTopicListBySlugFailAction,
    GetBBSTopicListBySlugSuccessAction,
};
