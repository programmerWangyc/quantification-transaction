import { Action } from '@ngrx/store';

import { SignupResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { SignupRequest } from './../../interfaces/request.interface';

export enum SignupOrder {
    username,
    email,
    password,
    refUser,
    refUrl,
    length
}

/* ===========================================Api action=================================== */

// signup
export class SignupAction extends ApiAction {
    isSingleParams = false;

    command = 'Signup';

    order = SignupOrder;

    constructor() { super() }
}

export const SIGNUP = 'SIGNUP';

export class SignupRequestAction extends SignupAction implements Action {
    readonly type = SIGNUP;

    constructor(public payload: SignupRequest) { super() }
}

export const SIGNUP_FAIL = 'SIGNUP_FAIL';

export class SignupFailAction extends SignupAction implements Action {
    readonly type = SIGNUP_FAIL;

    constructor(public payload: SignupResponse) { super() }
}

export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';

export class SignupSuccessAction extends SignupAction implements Action {
    readonly type = SIGNUP_SUCCESS;

    constructor(public payload: SignupResponse) { super() }
}

/* ===========================================Local action=================================== */

export const TOGGLE_AGREE_STATE = 'TOGGLE_AGREE_STATE';

export class ToggleAgreeStateAction implements Action {
    readonly type = TOGGLE_AGREE_STATE;

    constructor(public payload: boolean) { }
}

export type ApiActions = SignupRequestAction
    | SignupFailAction
    | SignupSuccessAction

export type Actions = ApiActions
    | ToggleAgreeStateAction

