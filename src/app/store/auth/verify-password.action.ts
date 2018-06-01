import { Action } from '@ngrx/store';

import { VerifyPasswordResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { VerifyPasswordRequest } from './../../interfaces/request.interface';

/* ===========================================Api action=================================== */

// verify password
export class VerifyPasswordAction extends ApiAction {
    isSingleParams = true;

    command = 'VerifyPassword';

    order = null;

    noneParams = false;

    constructor() { super() }
}

export const VERIFY_PASSWORD = '[Auth] VERIFY_PASSWORD';

export class VerifyPasswordRequestAction extends VerifyPasswordAction implements Action {
    readonly type = VERIFY_PASSWORD;

    public allowSeparateRequest = true;

    constructor(public payload: VerifyPasswordRequest) { super() }
}

export const VERIFY_PASSWORD_FAIL = '[Auth] VERIFY_PASSWORD_FAIL';

export class VerifyPasswordFailAction extends VerifyPasswordAction implements Action {
    readonly type = VERIFY_PASSWORD_FAIL;

    constructor(public payload: VerifyPasswordResponse) { super() }
}

export const VERIFY_PASSWORD_SUCCESS = '[Auth] VERIFY_PASSWORD_SUCCESS';

export class VerifyPasswordSuccessAction extends VerifyPasswordAction implements Action {
    readonly type = VERIFY_PASSWORD_SUCCESS;

    constructor(public payload: VerifyPasswordResponse) { super() }
}

/* ===========================================Local action=================================== */

export const RESET_VERIFY_PASSWORD = '[Auth] RESET_VERIFY_PASSWORD';

export class ResetVerifyPasswordResponseAction implements Action {
    readonly type = RESET_VERIFY_PASSWORD;

    constructor() { }
}

export const STORE_PWD_TEMPORARY = '[Auth] STORE_PWD_TEMPORARY';

export class StorePwdTemporaryAction implements Action {
    readonly type = STORE_PWD_TEMPORARY;

    constructor(public payload: string) { }
}

export type ApiActions = VerifyPasswordRequestAction
    | VerifyPasswordFailAction
    | VerifyPasswordSuccessAction

export type Actions = ApiActions
    | ResetVerifyPasswordResponseAction
    | StorePwdTemporaryAction

export const ResponseActions = {
    VerifyPasswordFailAction,
    VerifyPasswordSuccessAction
}
