import { Action } from '@ngrx/store';

import { GetBBSTopicRequest } from '../../interfaces/request.interface';
import { GetBBSTopicResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

// document
class GetDocument extends ApiAction {
    isSingleParams = true;

    command = 'GetBBSTopic';

    noneParams = false;

    callbackId = 'GetDocument';

    order = null;
}

export const GET_DOCUMENT = '[DOCUMENT] GET_DOCUMENT';

export class GetDocumentRequestAction extends GetDocument implements Action {
    readonly type = GET_DOCUMENT;

    constructor(public payload: GetBBSTopicRequest) { super(); }
}

export const GET_DOCUMENT_FAIL = '[DOCUMENT] GET_DOCUMENT_FAIL';

export class GetDocumentFailAction extends GetDocument implements Action {
    readonly type = GET_DOCUMENT_FAIL;

    constructor(public payload: GetBBSTopicResponse) { super(); }
}

export const GET_DOCUMENT_SUCCESS = '[DOCUMENT] GET_DOCUMENT_SUCCESS';

export class GetDocumentSuccessAction extends GetDocument implements Action {
    readonly type = GET_DOCUMENT_SUCCESS;

    constructor(public payload: GetBBSTopicResponse) { super(); }
}

//  ===========================================Local action===================================

/**
 * no local actions
 */

export type ApiActions = GetDocumentRequestAction
    | GetDocumentFailAction
    | GetDocumentSuccessAction

export type Actions = ApiActions;

export const ResponseActions = {
    GetDocumentFailAction,
    GetDocumentSuccessAction,
};
