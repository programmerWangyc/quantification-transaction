import { Actions as login, ApiActions as apiLogin } from './auth/login.action';
import { Actions as signup, ApiActions as apiSignup } from './auth/signup.action';
import { Actions as pub, ApiActions as apiPublic } from './public/public.action';

export const failTail = 'FailAction';

export const successTail = 'SuccessAction';


export type Actions = pub
    | login
    | signup

export type ApiActions = apiLogin
    | apiSignup
    | apiPublic