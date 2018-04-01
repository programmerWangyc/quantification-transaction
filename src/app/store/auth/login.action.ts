import { Action } from '@ngrx/store';

import { LoginRequest } from '../../interfaces/request.interface';
import { LoginResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

/**
 * @enum LoginOrder
 * @description This enum indicate the parameter's order which send to the server. All parameters of this interface must be listed here event if the
 * field may be optional, and the 'length' property must be the last member.
 */
export enum LoginOrder {
    username,
    password,
    secondaryVerificationCode,
    length
}

/**
 * @class LoginAction
 * @description The base class of login action. This class holds complete parameter configuration information 
 * and can convert the data carried in the action into a format that meets the communication requirements.
 */
export class LoginAction extends ApiAction {
    isSingleParams = false;

    command = 'Login';

    order = LoginOrder;
    
    constructor() { super() }
}

export const LOGIN = 'LOGIN';

export class LoginRequestAction extends LoginAction implements Action {
    readonly type = LOGIN;

    constructor(public payload: LoginRequest) { super() }
}

export const LOGIN_FAIL = 'LOGIN_FAIL';

export class LoginFailAction extends LoginAction implements Action {
    readonly type = LOGIN_FAIL;

    constructor(public payload: LoginResponse) { super() }
}

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export class LoginSuccessAction extends LoginAction implements Action {
    readonly type = LOGIN_SUCCESS;

    constructor(public payload: LoginResponse) { super() }
}

export type ApiActions = LoginRequestAction
    | LoginFailAction
    | LoginSuccessAction;

export type Actions = ApiActions
