import { Action } from '@ngrx/store';

import {
    DeleteStrategyRequest,
    GenKeyRequest,
    GetStrategyListRequest,
    OpStrategyTokenRequest,
    ShareStrategyRequest,
    VerifyKeyRequest,
} from '../../interfaces/request.interface';
import { ApiAction } from '../base.action';
import {
    DeleteStrategyResponse,
    GenKeyResponse,
    GetStrategyListResponse,
    OpStrategyTokenResponse,
    ShareStrategyResponse,
    VerifyKeyResponse,
} from './../../interfaces/response.interface';

/* ===========================================Api action=================================== */

export enum GetStrategyListOrder {
    offset,
    limit,
    strategyType,
    categoryType,
    needArgsType,
    length
}

// Get strategy list
export class GetStrategyList extends ApiAction {
    isSingleParams = false;

    command = 'GetStrategyList';

    order = GetStrategyListOrder;

    noneParams = false;

    constructor() { super() };
}

export const GET_STRATEGY_LIST = '[Strategy] GET_STRATEGY_LIST';

export class GetStrategyListRequestAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST;

    allowSeparateRequest = false;

    constructor(public payload: GetStrategyListRequest) { super() }
}

export const GET_STRATEGY_LIST_FAIL = '[Strategy] GET_STRATEGY_LIST_FAIL';

export class GetStrategyListFailAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST_FAIL;

    constructor(public payload: GetStrategyListResponse) { super() }
}

export const GET_STRATEGY_LIST_SUCCESS = '[Strategy] GET_STRATEGY_LIST_SUCCESS';

export class GetStrategyListSuccessAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST_SUCCESS;

    constructor(public payload: GetStrategyListResponse) { super() }
}

// Share strategy
export enum ShareStrategyOrder {
    id,
    type,
    length
}

export class ShareStrategyAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = ShareStrategyOrder;

    command = 'ShareStrategy';

    allowSeparateRequest = true;

    constructor() { super() };
}

export const SHARE_STRATEGY = '[Strategy] SHARE_STRATEGY';

export class ShareStrategyRequestAction extends ShareStrategyAction implements Action {
    readonly type = SHARE_STRATEGY;

    constructor(public payload: ShareStrategyRequest) { super() }
}

export const SHARE_STRATEGY_FAIL = '[Strategy] SHARE_STRATEGY_FAIL';

export class ShareStrategyFailAction extends ShareStrategyAction implements Action {
    readonly type = SHARE_STRATEGY_FAIL;

    constructor(public payload: ShareStrategyResponse) { super() }
}

export const SHARE_STRATEGY_SUCCESS = '[Strategy] SHARE_STRATEGY_SUCCESS';

export class ShareStrategySuccessAction extends ShareStrategyAction implements Action {
    readonly type = SHARE_STRATEGY_SUCCESS;

    constructor(public payload: ShareStrategyResponse) { super() }
}

// gen key
export enum GenKeyOrder {
    type,
    strategyId,
    days,
    concurrent,
    length
}

export class GenKeyAction extends ApiAction {
    noneParams = false;

    isSingleParams = false;

    order = GenKeyOrder;

    command = 'GenKey';

    allowSeparateRequest = true;

    constructor() { super() };
}

export const GEN_KEY = '[Strategy] GEN_KEY';

export class GenKeyRequestAction extends GenKeyAction implements Action {
    readonly type = GEN_KEY;

    constructor(public payload: GenKeyRequest) { super() }
}

export const GEN_KEY_FAIL = '[Strategy] GEN_KEY_FAIL';

export class GenKeyFailAction extends GenKeyAction implements Action {
    readonly type = GEN_KEY_FAIL;

    constructor(public payload: GenKeyResponse) { super() };
}

export const GEN_KEY_SUCCESS = '[Strategy] GEN_KEY_SUCCESS';

export class GenKeySuccessAction extends GenKeyAction implements Action {
    readonly type = GEN_KEY_SUCCESS;

    constructor(public payload: GenKeyResponse) { super() };
}

// verify gen key
export enum VerifyKeyOrder {
    strategyId,
    verifyCode,
    length
}

export class VerifyKeyAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'VerifyKey';

    allowSeparateRequest = true;

    order = VerifyKeyOrder;

    constructor() { super() }
}

export const VERIFY_KEY = '[Strategy] VERIFY_KEY';

export class VerifyKeyRequestAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY;

    constructor(public payload: VerifyKeyRequest) { super() };
}

export const VERIFY_KEY_FAIL = '[Strategy] VERIFY_KEY_FAIL';

export class VerifyKeyFailAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY_FAIL;

    constructor(public payload: VerifyKeyResponse) { super() };
}

export const VERIFY_KEY_SUCCESS = '[Strategy] VERIFY_KEY_SUCCESS';

export class VerifyKeySuccessAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY_SUCCESS;

    constructor(public payload: VerifyKeyResponse) { super() };
}

// delete strategy
export class DeleteStrategyAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'DeleteStrategy';

    order = null;

    allowSeparateRequest = true;

    constructor() { super() }
}

export const DELETE_STRATEGY = '[Strategy] DELETE_STRATEGY '

export class DeleteStrategyRequestAction extends DeleteStrategyAction implements Action {
    readonly type = DELETE_STRATEGY;

    constructor(public payload: DeleteStrategyRequest) { super() }
}

export const DELETE_STRATEGY_FAIL = '[Strategy] DELETE_STRATEGY_FAIL';

export class DeleteStrategyFailAction extends DeleteStrategyAction implements Action {
    readonly type = DELETE_STRATEGY_FAIL;

    constructor(public payload: DeleteStrategyResponse) { super() }
}

export const DELETE_STRATEGY_SUCCESS = '[Strategy] DELETE_STRATEGY_SUCCESS';

export class DeleteStrategySuccessAction extends DeleteStrategyAction implements Action {
    readonly type = DELETE_STRATEGY_SUCCESS;

    constructor(public payload: DeleteStrategyResponse) { super() }
}

// op strategy token
export enum OpStrategyTokenOrder {
    strategyId,
    opCode,
    length
}

export class OpStrategyTokenAction extends ApiAction {
    order = OpStrategyTokenOrder;

    command = 'OpStrategyToken';

    isSingleParams = false;

    noneParams = false;

    allowSeparateRequest = true;

    constructor() { super() }
}

export const GET_STRATEGY_TOKEN = '[Strategy] GET_STRATEGY_TOKEN';

export class OpStrategyTokenRequestAction extends OpStrategyTokenAction implements Action {
    readonly type = GET_STRATEGY_TOKEN;

    constructor(public payload: OpStrategyTokenRequest) { super() }
}

export const GET_STRATEGY_TOKEN_FAIL = '[Strategy] GET_STRATEGY_TOKEN_FAIL';

export class OpStrategyTokenFailAction extends OpStrategyTokenAction implements Action {
    readonly type = GET_STRATEGY_TOKEN_FAIL;

    constructor(public payload: OpStrategyTokenResponse) { super() }
}

export const GET_STRATEGY_TOKEN_SUCCESS = '[Strategy] GET_STRATEGY_TOKEN_SUCCESS';

export class OpStrategyTokenSuccessAction extends OpStrategyTokenAction implements Action {
    readonly type = GET_STRATEGY_TOKEN_SUCCESS;

    constructor(public payload: OpStrategyTokenResponse) { super() }
}

/* ===========================================Local action=================================== */

export const UPDATE_STRATEGY_SECRET_KEY_STATE = '[Strategy] UPDATE_STRATEGY_SECRET_KEY_STATE';

export class UpdateStrategySecretKeyStateAction implements Action {
    readonly type = UPDATE_STRATEGY_SECRET_KEY_STATE;

    constructor(public payload: { id: number, hasToken: boolean }) { }
}

// reset state
export const RESET_STATE = '[Strategy] RESET_STATE';

export class ResetStateAction implements Action {
    readonly type = RESET_STATE;
}

export type ApiActions = GetStrategyListRequestAction
    | DeleteStrategyRequestAction
    | DeleteStrategyFailAction
    | DeleteStrategySuccessAction
    | GetStrategyListFailAction
    | GetStrategyListSuccessAction
    | ShareStrategyRequestAction
    | ShareStrategyFailAction
    | ShareStrategySuccessAction
    | GenKeyRequestAction
    | GenKeyFailAction
    | GenKeySuccessAction
    | VerifyKeyRequestAction
    | VerifyKeyFailAction
    | VerifyKeySuccessAction
    | OpStrategyTokenRequestAction
    | OpStrategyTokenFailAction
    | OpStrategyTokenSuccessAction

export type Actions = ApiActions
    | UpdateStrategySecretKeyStateAction
    | ResetStateAction

export const ResponseActions = {
    GetStrategyListFailAction,
    GetStrategyListSuccessAction,
    ShareStrategyFailAction,
    ShareStrategySuccessAction,
    GenKeyFailAction,
    GenKeySuccessAction,
    VerifyKeyFailAction,
    VerifyKeySuccessAction,
    DeleteStrategyFailAction,
    DeleteStrategySuccessAction,
    OpStrategyTokenFailAction,
    OpStrategyTokenSuccessAction,
}
