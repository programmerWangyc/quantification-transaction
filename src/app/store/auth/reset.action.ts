import { Action } from '@ngrx/store';

import { ResetPasswordResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { ResetPasswordRequest } from './../../interfaces/request.interface';

export class ResetPasswordAction extends ApiAction {
    isSingleParams = true;
    
    command = 'ResetPassword';

    order = null;

    constructor() { super() }
}

export const RESET_PASSWORD = 'RESET_PASSWORD';

export class ResetPasswordRequestAction extends ResetPasswordAction implements Action {
    readonly type = 'RESET_PASSWORD';

    constructor(public payload: ResetPasswordRequest) { super() }
}

export const RESET_PASSWORD_FAIL = 'RESET_PASSWORD_FAIL';

export class ResetPasswordFailAction extends ResetPasswordAction implements Action {
    readonly type = 'RESET_PASSWORD_FAIL';

    constructor(public payload: ResetPasswordResponse) { super() }
}

export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';

export class ResetPasswordSuccessAction extends ResetPasswordAction implements Action {
    readonly type = 'RESET_PASSWORD_SUCCESS';

    constructor(public payload: ResetPasswordResponse) { super() }
}

export type ApiActions = ResetPasswordRequestAction
    | ResetPasswordFailAction
    | ResetPasswordSuccessAction

export type Actions = ApiActions