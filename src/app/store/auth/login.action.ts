import { Action } from '@ngrx/store';

import { LoginRequest } from '../../interfaces/request.interface';
import { LoginResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';


//  ===========================================Api action===================================

/**
 * @enum LoginOrder
 *  This enum indicate the parameter's order which send to the server. All parameters of this interface must be listed here event if the
 * field may be optional, and the 'length' property must be the last member.
 */
export enum LoginOrder {
    username,
    password,
    verificationCode,
    length,
}

/**
 * @class LoginAction
 *  The base class of login action. This class holds complete parameter configuration information
 * and can convert the data carried in the action into a format that meets the communication requirements.
 */
export class LoginAction extends ApiAction {
    isSingleParams = false;

    command = 'Login';

    order = LoginOrder;

    noneParams = false;

    constructor() { super(); }
}

export const LOGIN = '[Login] LOGIN';

export class LoginRequestAction extends LoginAction implements Action {
    readonly type = LOGIN;

    constructor(public payload: LoginRequest) { super(); }
}

export const LOGIN_FAIL = '[Login] LOGIN_FAIL';

export class LoginFailAction extends LoginAction implements Action {
    readonly type = LOGIN_FAIL;

    constructor(public payload: LoginResponse) { super(); }
}

export const LOGIN_SUCCESS = '[Login] LOGIN_SUCCESS';

export class LoginSuccessAction extends LoginAction implements Action {
    readonly type = LOGIN_SUCCESS;

    constructor(public payload: LoginResponse) { super(); }
}

//  ===========================================Local action===================================

export const CLOSE_SECONDARY_VERIFY = '[Login] CLOSE_SECONDARY_VERIFY';

export class CloseSecondaryVerifyAction implements Action {
    readonly type = CLOSE_SECONDARY_VERIFY;
}

export const CLEAR_LOGIN_INFO = '[Login] CLEAR_LOGIN_INFO';

export class ClearLoginInfoAction implements Action {
    readonly type = CLEAR_LOGIN_INFO;
}

export type ApiActions = LoginRequestAction
    | LoginFailAction
    | LoginSuccessAction;

export type Actions = ApiActions
    | ClearLoginInfoAction
    | CloseSecondaryVerifyAction;

export const ResponseActions = {
    LoginFailAction,
    LoginSuccessAction,
};
