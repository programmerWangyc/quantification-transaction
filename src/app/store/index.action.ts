import { Actions as login, ApiActions as apiLogin } from './auth/login.action';
import { Actions as reset, ApiActions as apiReset } from './auth/reset.action';
import { Actions as signup, ApiActions as apiSignup } from './auth/signup.action';
import { Actions as pub, ApiActions as apiPublic } from './public/public.action';
import { Actions as pwd, ApiActions as apiPwd } from './auth/password.action';
import { Actions as exchange, ApiActions as apiExchange } from './exchange/exchange.action';

export const failTail = 'FailAction';

export const successTail = 'SuccessAction';


export type Actions = pub
    | login
    | signup
    | reset
    | pwd
    | exchange

export type ApiActions = apiLogin
    | apiSignup
    | apiPublic
    | apiReset
    | apiPwd
    | apiExchange