import { Action } from '@ngrx/store';

import { ResetPasswordResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { ResetPasswordRequest } from './../../interfaces/request.interface';

//  ===========================================Api action===================================

// reset password
export class ResetPasswordAction extends ApiAction {
    isSingleParams = true;

    command = 'ResetPassword';

    order = null;

    noneParams = false;

    constructor() { super() }
}

export const RESET_PASSWORD = '[Auth] RESET_PASSWORD';

export class ResetPasswordRequestAction extends ResetPasswordAction implements Action {
    readonly type = RESET_PASSWORD;

    public allowSeparateRequest = true;

    constructor(public payload: ResetPasswordRequest) { super() }
}

export const RESET_PASSWORD_FAIL = '[Auth] RESET_PASSWORD_FAIL';

export class ResetPasswordFailAction extends ResetPasswordAction implements Action {
    readonly type = RESET_PASSWORD_FAIL;

    constructor(public payload: ResetPasswordResponse) { super() }
}

export const RESET_PASSWORD_SUCCESS = '[Auth] RESET_PASSWORD_SUCCESS';

export class ResetPasswordSuccessAction extends ResetPasswordAction implements Action {
    readonly type = RESET_PASSWORD_SUCCESS;

    constructor(public payload: ResetPasswordResponse) { super() }
}

//  ===========================================Local action===================================

export const RESET_RESET_PASSWORD = '[Auth] RESET_RESET_PASSWORD';

export class ResetResetPasswordResponseAction implements Action {
    readonly type = RESET_RESET_PASSWORD;

    constructor() { }
}

export type ApiActions = ResetPasswordRequestAction
    | ResetPasswordFailAction
    | ResetPasswordSuccessAction

export type Actions = ApiActions
    | ResetResetPasswordResponseAction;

export const ResponseActions = {
    ResetPasswordFailAction,
    ResetPasswordSuccessAction
}
