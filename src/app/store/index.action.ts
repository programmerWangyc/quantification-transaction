import { Actions as login, ApiActions as apiLogin } from './auth/login.action';
import { Actions as pwd, ApiActions as apiPwd } from './auth/password.action';
import { Actions as reset, ApiActions as apiReset } from './auth/reset.action';
import { Actions as signup, ApiActions as apiSignup } from './auth/signup.action';
import { Actions as verifyPassword, ApiActions as apiVerifyPassword } from './auth/verify-password.action';
import { Actions as btNode, ApiActions as apiBtNode } from './bt-node/bt-node.action';
import { Actions as exchange, ApiActions as apiExchange } from './exchange/exchange.action';
import { Actions as platform, ApiActions as apiPlatform } from './platform/platform.action';
import { Actions as pub, ApiActions as apiPublic } from './public/public.action';
import { Actions as robot, ApiActions as apiRobot } from './robot/robot.action';

export const failTail = 'FailAction';

export const successTail = 'SuccessAction';


export type Actions = pub
    | login
    | signup
    | reset
    | pwd
    | exchange
    | robot
    | btNode
    | platform
    | verifyPassword

export type ApiActions = apiLogin
    | apiSignup
    | apiPublic
    | apiReset
    | apiPwd
    | apiExchange
    | apiRobot
    | apiBtNode
    | apiPlatform
    | apiVerifyPassword