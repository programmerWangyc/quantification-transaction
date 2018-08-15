import { Action } from '@ngrx/store';

import { GetSandboxTokenRequest } from '../../interfaces/request.interface';
import { GetSandboxTokenResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

// Get sandbox token
class GetSandboxToken extends ApiAction {
    isSingleParams = false;

    command = 'GetSandBoxToken';

    order = null;

    noneParams = true;
}

export const GET_SANDBOX_TOKEN = '[Simulation] GET_SANDBOX_TOKEN';

export class GetSandBoxTokenRequestAction extends GetSandboxToken implements Action {
    readonly type = GET_SANDBOX_TOKEN;

    constructor(public payload: GetSandboxTokenRequest = null) { super(); }
}

export const GET_SANDBOX_TOKEN_FAIL = '[Simulation] GET_SANDBOX_TOKEN_FAIL';

export class GetSandBoxTokenFailAction extends GetSandboxToken implements Action {
    readonly type = GET_SANDBOX_TOKEN_FAIL;

    constructor(public payload: GetSandboxTokenResponse) { super(); }
}

export const GET_SANDBOX_TOKEN_SUCCESS = '[Simulation] GET_SANDBOX_TOKEN_SUCCESS';

export class GetSandBoxTokenSuccessAction extends GetSandboxToken implements Action {
    readonly type = GET_SANDBOX_TOKEN_SUCCESS;

    constructor(public payload: GetSandboxTokenResponse) { super(); }
}

//  ===========================================Local action===================================

export type ApiActions = GetSandBoxTokenRequestAction
    | GetSandBoxTokenFailAction
    | GetSandBoxTokenSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    GetSandBoxTokenFailAction,
    GetSandBoxTokenSuccessAction,
};
