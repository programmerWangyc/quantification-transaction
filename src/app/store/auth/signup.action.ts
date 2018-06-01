import { Action } from '@ngrx/store';

import { SignupResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { SignupRequest } from './../../interfaces/request.interface';

/* ===========================================Api action=================================== */

// signup
export enum SignupOrder {
    username,
    email,
    password,
    refUser,
    refUrl,
    length
}

export class SignupAction extends ApiAction {
    isSingleParams = false;

    command = 'Signup';

    order = SignupOrder;

    noneParams = false;

    constructor() { super() }
}

export const SIGNUP = '[Signup] SIGNUP';

export class SignupRequestAction extends SignupAction implements Action {
    readonly type = SIGNUP;

    public allowSeparateRequest = true;

    constructor(public payload: SignupRequest) { super() }
}

export const SIGNUP_FAIL = '[Signup] SIGNUP_FAIL';

export class SignupFailAction extends SignupAction implements Action {
    readonly type = SIGNUP_FAIL;

    constructor(public payload: SignupResponse) { super() }
}

export const SIGNUP_SUCCESS = '[Signup] SIGNUP_SUCCESS';

export class SignupSuccessAction extends SignupAction implements Action {
    readonly type = SIGNUP_SUCCESS;

    constructor(public payload: SignupResponse) { super() }
}

/* ===========================================Local action=================================== */

export const TOGGLE_AGREE_STATE = '[Signup] TOGGLE_AGREE_STATE';

export class ToggleAgreeStateAction implements Action {
    readonly type = TOGGLE_AGREE_STATE;

    constructor(public payload: boolean) { }
}

export const RESET_SIGNUP_RESPONSE_ACTION = '[Signup] RESET_SIGNUP_RESPONSE_ACTION';

export class ResetSignupResponseAction implements Action {
    readonly type = RESET_SIGNUP_RESPONSE_ACTION;

    constructor() { }
}

export type ApiActions = SignupRequestAction
    | SignupFailAction
    | SignupSuccessAction

export type Actions = ApiActions
    | ToggleAgreeStateAction
    | ResetSignupResponseAction

export const ResponseActions = {
    SignupFailAction,
    SignupSuccessAction,
}
