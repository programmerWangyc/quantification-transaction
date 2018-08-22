import { Actions as account, ApiActions as apiAccount } from './account/account.action';
import { Actions as login, ApiActions as apiLogin } from './auth/login.action';
import { Actions as pwd, ApiActions as apiPwd } from './auth/password.action';
import { Actions as reset, ApiActions as apiReset } from './auth/reset.action';
import { Actions as signup, ApiActions as apiSignup } from './auth/signup.action';
import { Actions as verifyPassword, ApiActions as apiVerifyPassword } from './auth/verify-password.action';
import { Actions as backtest, ApiActions as apiBacktest } from './backtest/backtest.action';
import { Actions as bbs, ApiActions as apiBBS } from './bbs/bbs.action';
import { Actions as btNode, ApiActions as apiBtNode } from './bt-node/bt-node.action';
import { Actions as charge, ApiActions as apiCharge } from './charge/charge.action';
import { Actions as comment, ApiActions as apiComment } from './comment/comment.action';
import { Actions as document, ApiActions as apiDocument } from './document/document.action';
import { Actions as exchange, ApiActions as apiExchange } from './exchange/exchange.action';
import { Actions as platform, ApiActions as apiPlatform } from './platform/platform.action';
import { Actions as pub, ApiActions as apiPublic } from './public/public.action';
import { Actions as robot, ApiActions as apiRobot } from './robot/robot.action';
import { Actions as simulation, ApiActions as apiSimulation } from './simulation/simulation.action';
import { Actions as strategy, ApiActions as apiStrategy } from './strategy/strategy.action';
import { Actions as watchDog, ApiActions as apiWatchDog } from './watch-dog/watch-dog.action';

export const failTail = 'FailAction';

export const successTail = 'SuccessAction';

export type Actions = pub
    | account
    | backtest
    | bbs
    | btNode
    | charge
    | comment
    | document
    | exchange
    | login
    | platform
    | pwd
    | reset
    | robot
    | signup
    | simulation
    | strategy
    | verifyPassword
    | watchDog;

export type ApiActions = apiLogin
    | apiAccount
    | apiBBS
    | apiBacktest
    | apiBtNode
    | apiCharge
    | apiComment
    | apiDocument
    | apiExchange
    | apiPlatform
    | apiPublic
    | apiPwd
    | apiReset
    | apiRobot
    | apiSignup
    | apiSimulation
    | apiStrategy
    | apiVerifyPassword
    | apiWatchDog;
