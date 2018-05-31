import { Action } from '@ngrx/store';

import { GetStrategyListRequest, ShareStrategyRequest, GenKeyRequest, VerifyKeyRequest } from '../../interfaces/request.interface';
import { ApiAction } from '../base.action';
import { GetStrategyListResponse, ShareStrategyResponse, GenKeyResponse, VerifyKeyResponse } from './../../interfaces/response.interface';

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

export const VERIFY_KEY = 'VERIFY_KEY';

export class VerifyKeyRequestAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY;

    constructor(public payload: VerifyKeyRequest) { super() };
}

export const VERIFY_KEY_FAIL = 'VERIFY_KEY_FAIL';

export class VerifyKeyFailAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY_FAIL;

    constructor(public payload: VerifyKeyResponse) { super() };
}

export const VERIFY_KEY_SUCCESS = 'VERIFY_KEY_SUCCESS';

export class VerifyKeySuccessAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY_SUCCESS;

    constructor(public payload: VerifyKeyResponse) { super() };
}

/* ===========================================Local action=================================== */

/* none local action */

export type ApiActions = GetStrategyListRequestAction
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

export type Actions = ApiActions

export const ResponseActions = {
    GetStrategyListFailAction,
    GetStrategyListSuccessAction,
    ShareStrategyFailAction,
    ShareStrategySuccessAction,
    GenKeyFailAction,
    GenKeySuccessAction,
    VerifyKeyFailAction,
    VerifyKeySuccessAction,
}
