import { Action } from '@ngrx/store';

import { GetCommentListRequest, GetQiniuTokenRequest, SubmitCommentRequest } from '../../interfaces/request.interface';
import {
    GetCommentListResponse, GetQiniuTokenResponse, SubmitCommentResponse
} from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

// get comment list
enum CommentListOrder {
    topic,
    offset,
    limit,
    length,
}

class GetCommentList extends ApiAction {
    isSingleParams = false;

    command = 'GetCommentList';

    order = CommentListOrder;

    noneParams = false;

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const GET_COMMENT_LIST = '[Comment] GET_COMMENT_LIST';

export class GetCommentListRequestAction extends GetCommentList implements Action {
    readonly type = GET_COMMENT_LIST;

    constructor(public payload: GetCommentListRequest) { super(); }
}

export const GET_COMMENT_LIST_FAIL = '[Comment] GET_COMMENT_LIST_FAIL';

export class GetCommentListFailAction extends GetCommentList implements Action {
    readonly type = GET_COMMENT_LIST_FAIL;

    constructor(public payload: GetCommentListResponse) { super(); }
}

export const GET_COMMENT_LIST_SUCCESS = '[Comment] GET_COMMENT_LIST_SUCCESS';

export class GetCommentListSuccessAction extends GetCommentList implements Action {
    readonly type = GET_COMMENT_LIST_SUCCESS;

    constructor(public payload: GetCommentListResponse) { super(); }
}

// submit comment
enum SubmitCommentOrder {
    topic,
    content,
    replyId,
    subReplyId,
    commentId,
    length,
}

class SubmitComment extends ApiAction {
    isSingleParams = false;

    command = 'SubmitComment';

    noneParams = false;

    allowSeparateRequest = true;

    order = SubmitCommentOrder;
}

export const SUBMIT_COMMENT = '[Comment] SUBMIT_COMMENT';

export class SubmitCommentRequestAction extends SubmitComment implements Action {
    readonly type = SUBMIT_COMMENT;

    constructor(public payload: SubmitCommentRequest) { super(); }
}

export const SUBMIT_COMMENT_FAIL = '[Comment] SUBMIT_COMMENT_FAIL';

export class SubmitCommentFailAction extends SubmitComment implements Action {
    readonly type = SUBMIT_COMMENT_FAIL;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

export const SUBMIT_COMMENT_SUCCESS = '[Comment] SUBMIT_COMMENT_SUCCESS';

export class SubmitCommentSuccessAction extends SubmitComment implements Action {
    readonly type = SUBMIT_COMMENT_SUCCESS;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

// qiniu token
export class GetQiniuToken extends ApiAction {
    isSingleParams = true;

    command = 'GetQiniuToken';

    noneParams = false;

    allowSeparateRequest = true;

    order = null;
}

export const GET_QINIU_TOKEN = '[Comment] GET_QINIU_TOKEN';

export class GetQiniuTokenRequestAction extends GetQiniuToken implements Action {
    readonly type = GET_QINIU_TOKEN;

    constructor(public payload: GetQiniuTokenRequest) { super(); }
}

export const GET_QINIU_TOKEN_FAIL = '[Comment] GET_QINIU_TOKEN_FAIL';

export class GetQiniuTokenFailAction extends GetQiniuToken implements Action {
    readonly type = GET_QINIU_TOKEN_FAIL;

    constructor(public payload: GetQiniuTokenResponse) { super(); }
}

export const GET_QINIU_TOKEN_SUCCESS = '[Comment] GET_QINIU_TOKEN_SUCCESS';

export class GetQiniuTokenSuccessAction extends GetQiniuToken implements Action {
    readonly type = GET_QINIU_TOKEN_SUCCESS;

    constructor(public payload: GetQiniuTokenResponse) { super(); }
}

//  ===========================================Local action===================================

//  none local action

export type ApiActions = GetCommentListRequestAction
    | GetCommentListFailAction
    | GetCommentListSuccessAction
    | SubmitCommentRequestAction
    | SubmitCommentFailAction
    | SubmitCommentSuccessAction
    | GetQiniuTokenRequestAction
    | GetQiniuTokenFailAction
    | GetQiniuTokenSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    GetCommentListFailAction,
    GetCommentListSuccessAction,
    SubmitCommentFailAction,
    SubmitCommentSuccessAction,
    GetQiniuTokenFailAction,
    GetQiniuTokenSuccessAction,
};
