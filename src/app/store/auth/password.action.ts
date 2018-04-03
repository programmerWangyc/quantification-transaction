import { SetPasswordRequest } from './../../interfaces/request.interface';
import { ApiAction } from "../base.action";
import { Action } from '@ngrx/store';
import { SetPasswordResponse } from '../../interfaces/response.interface';

/* ===========================================Api action=================================== */

// set password
export enum SetPasswordOrder {
    token,
    password,
    length
}

export class SetPasswordAction extends ApiAction {
    isSingleParams = false;

    command = 'SetPassword';

    order = SetPasswordOrder;

    noneParams = false;

    constructor() { super() }
}

export const SET_PASSWORD = 'SET_PASSWORD';

export class SetPasswordRequestAction extends SetPasswordAction implements Action {
    readonly type = SET_PASSWORD;

    public allowSeparateRequest = true;
    
    constructor(public payload: SetPasswordRequest) { super() }
}

export const SET_PASSWORD_FAIL = 'SET_PASSWORD_FAIL';

export class SetPasswordFailAction extends SetPasswordAction implements Action {
    readonly type = SET_PASSWORD_FAIL;

    constructor(public payload: SetPasswordResponse) { super() }
}

export const SET_PASSWORD_SUCCESS = 'SET_PASSWORD_SUCCESS';

export class SetPasswordSuccessAction extends SetPasswordAction implements Action {
    readonly type = SET_PASSWORD_SUCCESS;

    constructor(public payload: SetPasswordResponse) { super() }
}

/* ===========================================Local action=================================== */

export const RESET_SET_PASSWORD = 'RESET_SET_PASSWORD';

export class ResetSetPasswordResponseAction implements Action {
    readonly type = RESET_SET_PASSWORD;

    constructor() { }
}

export type ApiActions = SetPasswordRequestAction
    | SetPasswordFailAction
    | SetPasswordSuccessAction

export type Actions = ApiActions
    | ResetSetPasswordResponseAction

export const ResponseActions = {
    SetPasswordFailAction,
    SetPasswordSuccessAction,
}