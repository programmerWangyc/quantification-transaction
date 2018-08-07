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

/**
 * *Submit接口被重新拆分，同样拆分的还有backtestIO接口，为了少写解析代码。
 */
export enum SubmitCommentCallbackId {
    add = 'AddComment',
    update = 'UpdateComment',
    delete = 'DeleteComment',
}

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

// add comment
class AddComment extends SubmitComment {
    callbackId = SubmitCommentCallbackId.add;
}

export const ADD_COMMENT = '[Comment] ADD_COMMENT';

export class AddCommentRequestAction extends AddComment implements Action {
    readonly type = ADD_COMMENT;


    constructor(public payload: SubmitCommentRequest) { super(); }
}

export const ADD_COMMENT_FAIL = '[Comment] ADD_COMMENT_FAIL';

export class AddCommentFailAction extends AddComment implements Action {
    readonly type = ADD_COMMENT_FAIL;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

export const ADD_COMMENT_SUCCESS = '[Comment] ADD_COMMENT_SUCCESS';

export class AddCommentSuccessAction extends AddComment implements Action {
    readonly type = ADD_COMMENT_SUCCESS;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

// update comment
class UpdateComment extends SubmitComment {
    callbackId = SubmitCommentCallbackId.update;
}

export const UPDATE_COMMENT = '[Comment] UPDATE_COMMENT';

export class UpdateCommentRequestAction extends UpdateComment implements Action {
    readonly type = UPDATE_COMMENT;


    constructor(public payload: SubmitCommentRequest) { super(); }
}

export const UPDATE_COMMENT_FAIL = '[Comment] UPDATE_COMMENT_FAIL';

export class UpdateCommentFailAction extends UpdateComment implements Action {
    readonly type = UPDATE_COMMENT_FAIL;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

export const UPDATE_COMMENT_SUCCESS = '[Comment] UPDATE_COMMENT_SUCCESS';

export class UpdateCommentSuccessAction extends UpdateComment implements Action {
    readonly type = UPDATE_COMMENT_SUCCESS;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

// delete comment
class DeleteComment extends SubmitComment {
    callbackId = SubmitCommentCallbackId.delete;
}

export const DELETE_COMMENT = '[Comment] DELETE_COMMENT';

export class DeleteCommentRequestAction extends DeleteComment implements Action {
    readonly type = DELETE_COMMENT;


    constructor(public payload: SubmitCommentRequest) { super(); }
}

export const DELETE_COMMENT_FAIL = '[Comment] DELETE_COMMENT_FAIL';

export class DeleteCommentFailAction extends DeleteComment implements Action {
    readonly type = DELETE_COMMENT_FAIL;

    constructor(public payload: SubmitCommentResponse) { super(); }
}

export const DELETE_COMMENT_SUCCESS = '[Comment] DELETE_COMMENT_SUCCESS';

export class DeleteCommentSuccessAction extends DeleteComment implements Action {
    readonly type = DELETE_COMMENT_SUCCESS;

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
    | AddCommentRequestAction
    | AddCommentFailAction
    | AddCommentSuccessAction
    | DeleteCommentRequestAction
    | DeleteCommentFailAction
    | DeleteCommentSuccessAction
    | GetQiniuTokenRequestAction
    | GetQiniuTokenFailAction
    | GetQiniuTokenSuccessAction
    | UpdateCommentRequestAction
    | UpdateCommentFailAction
    | UpdateCommentSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    GetCommentListFailAction,
    GetCommentListSuccessAction,
    AddCommentFailAction,
    AddCommentSuccessAction,
    DeleteCommentFailAction,
    DeleteCommentSuccessAction,
    GetQiniuTokenFailAction,
    GetQiniuTokenSuccessAction,
    UpdateCommentFailAction,
    UpdateCommentSuccessAction,
};
