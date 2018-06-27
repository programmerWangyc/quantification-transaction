import { Action } from '@ngrx/store';

import {
    DeleteStrategyRequest,
    GenKeyRequest,
    GetStrategyDetailRequest,
    GetStrategyListRequest,
    OpStrategyTokenRequest,
    SaveStrategyRequest,
    ShareStrategyRequest,
    VerifyKeyRequest,
} from '../../interfaces/request.interface';
import { ApiAction } from '../base.action';
import {
    DeleteStrategyResponse,
    GenKeyResponse,
    GetStrategyDetailResponse,
    GetStrategyListResponse,
    OpStrategyTokenResponse,
    SaveStrategyResponse,
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
class GetStrategyList extends ApiAction {
    isSingleParams = false;

    command = 'GetStrategyList';

    order = GetStrategyListOrder;

    noneParams = false;

    constructor() { super() };
}

export const GET_STRATEGY_LIST = '[Strategy] GET_STRATEGY_LIST';

export class GetStrategyListRequestAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST;

    allowSeparateRequest = true;

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

class ShareStrategyAction extends ApiAction {
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

class GenKeyAction extends ApiAction {
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

class VerifyKeyAction extends ApiAction {
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
class DeleteStrategyAction extends ApiAction {
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

class OpStrategyTokenAction extends ApiAction {
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

// strategy detail
class GetStrategyDetailAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'GetStrategyDetail';

    order = null;

    constructor() { super() };
}

export const GET_STRATEGY_DETAIL = '[Strategy] GET_STRATEGY_DETAIL';

export class GetStrategyDetailRequestAction extends GetStrategyDetailAction implements Action {
    readonly type = GET_STRATEGY_DETAIL;

    allowSeparateRequest = true;

    constructor(public payload: GetStrategyDetailRequest) { super() };
}

export const GET_STRATEGY_DETAIL_FAIL = '[Strategy] GET_STRATEGY_DETAIL_FAIL';

export class GetStrategyDetailFailAction extends GetStrategyDetailAction implements Action {
    readonly type = GET_STRATEGY_DETAIL_FAIL;

    constructor(public payload: GetStrategyDetailResponse) { super() };
}

export const GET_STRATEGY_DETAIL_SUCCESS = '[Strategy] GET_STRATEGY_DETAIL_SUCCESS';

export class GetStrategyDetailSuccessAction extends GetStrategyDetailAction implements Action {
    readonly type = GET_STRATEGY_DETAIL_SUCCESS;

    constructor(public payload: GetStrategyDetailResponse) { super() };
}

// save strategy
export enum SaveStrategyOrder {
    id,
    categoryId,
    languageId,
    name,
    des,
    args,
    code,
    note,
    manual,
    dependance,
    length
}

class SaveStrategyAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'SaveStrategy';

    order = SaveStrategyOrder;

    allowSeparateRequest = true;

    constructor() { super() }
}

export const SAVE_STRATEGY = '[Strategy] SAVE_STRATEGY';

export class SaveStrategyRequestAction extends SaveStrategyAction implements Action {
    readonly type = SAVE_STRATEGY;

    constructor(public payload: SaveStrategyRequest) { super() }
}

export const SAVE_STRATEGY_FAIL = '[Strategy] SAVE_STRATEGY_FAIL';

export class SaveStrategyFailAction extends SaveStrategyAction implements Action {
    readonly type = SAVE_STRATEGY_FAIL;

    constructor(public payload: SaveStrategyResponse) { super() }
}

export const SAVE_STRATEGY_SUCCESS = '[Strategy] SAVE_STRATEGY_SUCCESS';

export class SaveStrategySuccessAction extends SaveStrategyAction implements Action {
    readonly type = SAVE_STRATEGY_SUCCESS;

    constructor(public payload: SaveStrategyResponse) { super() }
}

/* ===========================================Local action=================================== */

// update strategy hasToken field
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

// update selected dependance templates
export const UPDATE_STRATEGY_DEPENDANCE_TEMPLATES = '[Strategy] UPDATE_STRATEGY_DEPENDANCE_TEMPLATES';

export class UpdateStrategyDependanceTemplatesAction implements Action {
    readonly type = UPDATE_STRATEGY_DEPENDANCE_TEMPLATES;

    constructor(public payload: number[]) { };
}

// update selected language
export const UPDATE_SELECTED_LANGUAGE = '[Strategy] UPDATE_SELECTED_LANGUAGE';

export class UpdateStrategyLanguageAction implements Action {
    readonly type = UPDATE_SELECTED_LANGUAGE;

    constructor(public payload: number) { }
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
    | GetStrategyDetailRequestAction
    | GetStrategyDetailFailAction
    | GetStrategyDetailSuccessAction
    | SaveStrategyRequestAction
    | SaveStrategyFailAction
    | SaveStrategySuccessAction

export type Actions = ApiActions
    | UpdateStrategySecretKeyStateAction
    | ResetStateAction
    | UpdateStrategyDependanceTemplatesAction
    | UpdateStrategyLanguageAction

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
    GetStrategyDetailFailAction,
    GetStrategyDetailSuccessAction,
    SaveStrategyFailAction,
    SaveStrategySuccessAction,
}
