import { Action } from '@ngrx/store';

import {
    DeleteAPMMessageRequest, DeleteBBSNotifyRequest, DeleteMessageRequest, GetAPMMessageRequest, GetBBSNotifyRequest,
    GetMessageRequest
} from '../../interfaces/request.interface';
import {
    DeleteAPMMessageResponse, DeleteBBSNotifyResponse, DeleteMessageResponse, GetAPMMessageResponse,
    GetBBSNotifyResponse, GetMessageResponse
} from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

// =====================================================Server send event=========================================
//  ===========================================Api action===================================
enum GetNotifyOrder {
    offset,
    limit,
    length,
}

// push message
export class GetMessage extends ApiAction {
    isSingleParams = false;

    command = 'GetPushQueue';

    order = GetNotifyOrder;

    noneParams = false;

    callbackId = 'GetMessage';
}

export const GET_MESSAGE = '[Message] GET_MESSAGE';

export class GetMessageRequestAction extends GetMessage implements Action {
    readonly type = GET_MESSAGE;

    constructor(public payload: GetMessageRequest) { super(); }
}

export const GET_MESSAGE_FAIL = '[Message] GET_MESSAGE_FAIL';

export class GetMessageFailAction extends GetMessage implements Action {
    readonly type = GET_MESSAGE_FAIL;

    constructor(public payload: GetMessageResponse) { super(); }
}

export const GET_MESSAGE_SUCCESS = '[Message] GET_MESSAGE_SUCCESS';

export class GetMessageSuccessAction extends GetMessage implements Action {
    readonly type = GET_MESSAGE_SUCCESS;

    constructor(public payload: GetMessageResponse) { super(); }
}

// delete message
export class DeleteMessage extends ApiAction {
    isSingleParams = true;

    command = 'DeleteMessage';

    order = null;

    noneParams = false;
}

export const DELETE_MESSAGE = '[Message] DELETE_MESSAGE';

export class DeleteMessageRequestAction extends DeleteMessage implements Action {
    readonly type = DELETE_MESSAGE;

    constructor(public payload: DeleteMessageRequest) { super(); }
}

export const DELETE_MESSAGE_FAIL = '[Message] DELETE_MESSAGE_FAIL';

export class DeleteMessageFailAction extends DeleteMessage implements Action {
    readonly type = DELETE_MESSAGE_FAIL;

    constructor(public payload: DeleteMessageResponse) { super(); }
}

export const DELETE_MESSAGE_SUCCESS = '[Message] DELETE_MESSAGE_SUCCESS';

export class DeleteMessageSuccessAction extends DeleteMessage implements Action {
    readonly type = DELETE_MESSAGE_SUCCESS;

    constructor(public payload: DeleteMessageResponse) { super(); }
}

// apm message
export class GetAPMMessage extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = GetNotifyOrder;

    command = 'GetAPMQueue';

    callbackId = 'GetAPMMessage';
}

export const GET_APM_MESSAGE = '[Message] GET_APM_MESSAGE';

export class GetAPMMessageRequestAction extends GetAPMMessage implements Action {
    readonly type = GET_APM_MESSAGE;

    constructor(public payload: GetAPMMessageRequest) { super(); }
}

export const GET_APM_MESSAGE_FAIL = '[Message] GET_APM_MESSAGE_FAIL';

export class GetAPMMessageFailAction extends GetAPMMessage implements Action {
    readonly type = GET_APM_MESSAGE_FAIL;

    constructor(public payload: GetAPMMessageResponse) { super(); }
}

export const GET_APM_MESSAGE_SUCCESS = '[Message] GET_APM_MESSAGE_SUCCESS';

export class GetAPMMessageSuccessAction extends GetAPMMessage implements Action {
    readonly type = GET_APM_MESSAGE_SUCCESS;

    constructor(public payload: GetAPMMessageResponse) { super(); }
}

// delete apm message
export class DeleteAPMMessage extends ApiAction {
    isSingleParams = true;

    command = 'DeleteAPMMessage';

    order = null;

    noneParams = false;
}

export const DELETE_APM_MESSAGE = '[Message] DELETE_APM_MESSAGE';

export class DeleteAPMMessageRequestAction extends DeleteAPMMessage implements Action {
    readonly type = DELETE_APM_MESSAGE;

    constructor(public payload: DeleteAPMMessageRequest) { super(); }
}

export const DELETE_APM_MESSAGE_FAIL = '[Message] DELETE_APM_MESSAGE_FAIL';

export class DeleteAPMMessageFailAction extends DeleteAPMMessage implements Action {
    readonly type = DELETE_APM_MESSAGE_FAIL;

    constructor(public payload: DeleteAPMMessageResponse) { super(); }
}

export const DELETE_APM_MESSAGE_SUCCESS = '[Message] DELETE_APM_MESSAGE_SUCCESS';

export class DeleteAPMMessageSuccessAction extends DeleteAPMMessage implements Action {
    readonly type = DELETE_APM_MESSAGE_SUCCESS;

    constructor(public payload: DeleteAPMMessageResponse) { super(); }
}


// bbs notify
export class GetBBSNotify extends ApiAction {
    isSingleParams = false;

    command = 'GetBBSNotify';

    order = GetNotifyOrder;

    noneParams = false;
}

export const GET_BBS_NOTIFY = '[BBSNotify] GET_BBS_NOTIFY';

export class GetBBSNotifyRequestAction extends GetBBSNotify implements Action {
    readonly type = GET_BBS_NOTIFY;

    constructor(public payload: GetBBSNotifyRequest) { super(); }
}

export const GET_BBS_NOTIFY_FAIL = '[BBSNotify] GET_BBS_NOTIFY_FAIL';

export class GetBBSNotifyFailAction extends GetBBSNotify implements Action {
    readonly type = GET_BBS_NOTIFY_FAIL;

    constructor(public payload: GetBBSNotifyResponse) { super(); }
}

export const GET_BBS_NOTIFY_SUCCESS = '[BBSNotify] GET_BBS_NOTIFY_SUCCESS';

export class GetBBSNotifySuccessAction extends GetBBSNotify implements Action {
    readonly type = GET_BBS_NOTIFY_SUCCESS;

    constructor(public payload: GetBBSNotifyResponse) { super(); }
}

// delete bbs notify
export class DeleteBBSNotify extends ApiAction {
    isSingleParams = true;

    command = 'DeleteNotify';

    order = null;

    noneParams = false;

    callbackId = 'DeleteBBSNotify';
}

export const DELETE_BBS_NOTIFY = '[BBSNotify] DELETE_BBS_NOTIFY';

export class DeleteBBSNotifyRequestAction extends DeleteBBSNotify implements Action {
    readonly type = DELETE_BBS_NOTIFY;

    constructor(public payload: DeleteBBSNotifyRequest) { super(); }
}

export const DELETE_BBS_NOTIFY_FAIL = '[BBSNotify] DELETE_BBS_NOTIFY_FAIL';

export class DeleteBBSNotifyFailAction extends DeleteBBSNotify implements Action {
    readonly type = DELETE_BBS_NOTIFY_FAIL;

    constructor(public payload: DeleteBBSNotifyResponse) { super(); }
}

export const DELETE_BBS_NOTIFY_SUCCESS = '[BBSNotify] DELETE_BBS_NOTIFY_SUCCESS';

export class DeleteBBSNotifySuccessAction extends DeleteBBSNotify implements Action {
    readonly type = DELETE_BBS_NOTIFY_SUCCESS;

    constructor(public payload: DeleteBBSNotifyResponse) { super(); }
}

//  ===========================================Local action===================================

export type ApiActions = GetMessageRequestAction
    | DeleteAPMMessageFailAction
    | DeleteAPMMessageRequestAction
    | DeleteAPMMessageSuccessAction
    | DeleteBBSNotifyFailAction
    | DeleteBBSNotifyRequestAction
    | DeleteBBSNotifySuccessAction
    | DeleteMessageFailAction
    | DeleteMessageRequestAction
    | DeleteMessageSuccessAction
    | GetAPMMessageFailAction
    | GetAPMMessageRequestAction
    | GetAPMMessageSuccessAction
    | GetBBSNotifyFailAction
    | GetBBSNotifyRequestAction
    | GetBBSNotifySuccessAction
    | GetMessageFailAction
    | GetMessageSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    DeleteAPMMessageFailAction,
    DeleteAPMMessageSuccessAction,
    DeleteBBSNotifyFailAction,
    DeleteBBSNotifySuccessAction,
    DeleteMessageFailAction,
    DeleteMessageRequestAction,
    DeleteMessageSuccessAction,
    GetAPMMessageFailAction,
    GetAPMMessageRequestAction,
    GetAPMMessageSuccessAction,
    GetBBSNotifyFailAction,
    GetBBSNotifyRequestAction,
    GetBBSNotifySuccessAction,
    GetMessageFailAction,
    GetMessageSuccessAction,
};
