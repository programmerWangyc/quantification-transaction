import { Action } from '@ngrx/store';

import {
    DeleteStrategyRequest, GenKeyRequest, GetStrategyDetailRequest, GetStrategyListRequest, OpStrategyTokenRequest,
    SaveStrategyRequest, ShareStrategyRequest, VerifyKeyRequest, GetStrategyListByNameRequest, GetPublicStrategyDetailRequest
} from '../../interfaces/request.interface';
import {
    DeleteStrategyResponse, GenKeyResponse, GetStrategyDetailResponse, GetStrategyListResponse, OpStrategyTokenResponse,
    SaveStrategyResponse, ShareStrategyResponse, VerifyKeyResponse, GetStrategyListByNameResponse, GetPublicStrategyDetailResponse
} from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

export enum GetStrategyListOrder {
    offset,
    limit,
    strategyType,
    categoryType,
    needArgsType,
    length,
}


class GetStrategyList extends ApiAction {
    isSingleParams = false;

    command = 'GetStrategyList';

    order = GetStrategyListOrder;

    noneParams = false;

    constructor() { super(); }
}

export const GET_STRATEGY_LIST = '[Strategy] GET_STRATEGY_LIST';

export class GetStrategyListRequestAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST;

    constructor(public payload: GetStrategyListRequest) { super(); }
}

export const GET_STRATEGY_LIST_FAIL = '[Strategy] GET_STRATEGY_LIST_FAIL';

export class GetStrategyListFailAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST_FAIL;

    constructor(public payload: GetStrategyListResponse) { super(); }
}

export const GET_STRATEGY_LIST_SUCCESS = '[Strategy] GET_STRATEGY_LIST_SUCCESS';

export class GetStrategyListSuccessAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST_SUCCESS;

    constructor(public payload: GetStrategyListResponse) { super(); }
}


export enum ShareStrategyOrder {
    id,
    type,
    length,
}

class ShareStrategyAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = ShareStrategyOrder;

    command = 'ShareStrategy';

    constructor() { super(); }
}

export const SHARE_STRATEGY = '[Strategy] SHARE_STRATEGY';

export class ShareStrategyRequestAction extends ShareStrategyAction implements Action {
    readonly type = SHARE_STRATEGY;

    constructor(public payload: ShareStrategyRequest) { super(); }
}

export const SHARE_STRATEGY_FAIL = '[Strategy] SHARE_STRATEGY_FAIL';

export class ShareStrategyFailAction extends ShareStrategyAction implements Action {
    readonly type = SHARE_STRATEGY_FAIL;

    constructor(public payload: ShareStrategyResponse) { super(); }
}

export const SHARE_STRATEGY_SUCCESS = '[Strategy] SHARE_STRATEGY_SUCCESS';

export class ShareStrategySuccessAction extends ShareStrategyAction implements Action {
    readonly type = SHARE_STRATEGY_SUCCESS;

    constructor(public payload: ShareStrategyResponse) { super(); }
}


export enum GenKeyOrder {
    type,
    strategyId,
    days,
    concurrent,
    length,
}

class GenKeyAction extends ApiAction {
    noneParams = false;

    isSingleParams = false;

    order = GenKeyOrder;

    command = 'GenKey';

    constructor() { super(); }
}

export const GEN_KEY = '[Strategy] GEN_KEY';

export class GenKeyRequestAction extends GenKeyAction implements Action {
    readonly type = GEN_KEY;

    constructor(public payload: GenKeyRequest) { super(); }
}

export const GEN_KEY_FAIL = '[Strategy] GEN_KEY_FAIL';

export class GenKeyFailAction extends GenKeyAction implements Action {
    readonly type = GEN_KEY_FAIL;

    constructor(public payload: GenKeyResponse) { super(); }
}

export const GEN_KEY_SUCCESS = '[Strategy] GEN_KEY_SUCCESS';

export class GenKeySuccessAction extends GenKeyAction implements Action {
    readonly type = GEN_KEY_SUCCESS;

    constructor(public payload: GenKeyResponse) { super(); }
}


export enum VerifyKeyOrder {
    strategyId,
    verifyCode,
    length,
}

class VerifyKeyAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'VerifyKey';

    order = VerifyKeyOrder;

    constructor() { super(); }
}

export const VERIFY_KEY = '[Strategy] VERIFY_KEY';

export class VerifyKeyRequestAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY;

    constructor(public payload: VerifyKeyRequest) { super(); }
}

export const VERIFY_KEY_FAIL = '[Strategy] VERIFY_KEY_FAIL';

export class VerifyKeyFailAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY_FAIL;

    constructor(public payload: VerifyKeyResponse) { super(); }
}

export const VERIFY_KEY_SUCCESS = '[Strategy] VERIFY_KEY_SUCCESS';

export class VerifyKeySuccessAction extends VerifyKeyAction implements Action {
    readonly type = VERIFY_KEY_SUCCESS;

    constructor(public payload: VerifyKeyResponse) { super(); }
}


class DeleteStrategyAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'DeleteStrategy';

    order = null;

    constructor() { super(); }
}

export const DELETE_STRATEGY = '[Strategy] DELETE_STRATEGY ';

export class DeleteStrategyRequestAction extends DeleteStrategyAction implements Action {
    readonly type = DELETE_STRATEGY;

    constructor(public payload: DeleteStrategyRequest) { super(); }
}

export const DELETE_STRATEGY_FAIL = '[Strategy] DELETE_STRATEGY_FAIL';

export class DeleteStrategyFailAction extends DeleteStrategyAction implements Action {
    readonly type = DELETE_STRATEGY_FAIL;

    constructor(public payload: DeleteStrategyResponse) { super(); }
}

export const DELETE_STRATEGY_SUCCESS = '[Strategy] DELETE_STRATEGY_SUCCESS';

export class DeleteStrategySuccessAction extends DeleteStrategyAction implements Action {
    readonly type = DELETE_STRATEGY_SUCCESS;

    constructor(public payload: DeleteStrategyResponse) { super(); }
}


export enum OpStrategyTokenOrder {
    strategyId,
    opCode,
    length,
}

class OpStrategyTokenAction extends ApiAction {
    order = OpStrategyTokenOrder;

    command = 'OpStrategyToken';

    isSingleParams = false;

    noneParams = false;

    constructor() { super(); }
}

export const GET_STRATEGY_TOKEN = '[Strategy] GET_STRATEGY_TOKEN';

export class OpStrategyTokenRequestAction extends OpStrategyTokenAction implements Action {
    readonly type = GET_STRATEGY_TOKEN;

    constructor(public payload: OpStrategyTokenRequest) { super(); }
}

export const GET_STRATEGY_TOKEN_FAIL = '[Strategy] GET_STRATEGY_TOKEN_FAIL';

export class OpStrategyTokenFailAction extends OpStrategyTokenAction implements Action {
    readonly type = GET_STRATEGY_TOKEN_FAIL;

    constructor(public payload: OpStrategyTokenResponse) { super(); }
}

export const GET_STRATEGY_TOKEN_SUCCESS = '[Strategy] GET_STRATEGY_TOKEN_SUCCESS';

export class OpStrategyTokenSuccessAction extends OpStrategyTokenAction implements Action {
    readonly type = GET_STRATEGY_TOKEN_SUCCESS;

    constructor(public payload: OpStrategyTokenResponse) { super(); }
}


class GetStrategyDetailAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'GetStrategyDetail';

    order = null;

    constructor() { super(); }
}

export const GET_STRATEGY_DETAIL = '[Strategy] GET_STRATEGY_DETAIL';

export class GetStrategyDetailRequestAction extends GetStrategyDetailAction implements Action {
    readonly type = GET_STRATEGY_DETAIL;

    constructor(public payload: GetStrategyDetailRequest) { super(); }
}

export const GET_STRATEGY_DETAIL_FAIL = '[Strategy] GET_STRATEGY_DETAIL_FAIL';

export class GetStrategyDetailFailAction extends GetStrategyDetailAction implements Action {
    readonly type = GET_STRATEGY_DETAIL_FAIL;

    constructor(public payload: GetStrategyDetailResponse) { super(); }
}

export const GET_STRATEGY_DETAIL_SUCCESS = '[Strategy] GET_STRATEGY_DETAIL_SUCCESS';

export class GetStrategyDetailSuccessAction extends GetStrategyDetailAction implements Action {
    readonly type = GET_STRATEGY_DETAIL_SUCCESS;

    constructor(public payload: GetStrategyDetailResponse) { super(); }
}


class GetPublicStrategyDetailAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'GetPublicStrategyDetail';

    order = null;
}

export const GET_PUBLIC_STRATEGY_DETAIL = '[Strategy] GET_PUBLIC_STRATEGY_DETAIL';

export class GetPublicStrategyDetailRequestAction extends GetPublicStrategyDetailAction implements Action {
    readonly type = GET_PUBLIC_STRATEGY_DETAIL;

    constructor(public payload: GetPublicStrategyDetailRequest) { super(); }
}

export const GET_PUBLIC_STRATEGY_DETAIL_FAIL = '[Strategy] GET_PUBLIC_STRATEGY_DETAIL_FAIL';

export class GetPublicStrategyDetailFailAction extends GetPublicStrategyDetailAction implements Action {
    readonly type = GET_PUBLIC_STRATEGY_DETAIL_FAIL;

    constructor(public payload: GetPublicStrategyDetailResponse) { super(); }
}

export const GET_PUBLIC_STRATEGY_DETAIL_SUCCESS = '[Strategy] GET_PUBLIC_STRATEGY_DETAIL_SUCCESS';

export class GetPublicStrategyDetailSuccessAction extends GetPublicStrategyDetailAction implements Action {
    readonly type = GET_PUBLIC_STRATEGY_DETAIL_SUCCESS;

    constructor(public payload: GetPublicStrategyDetailResponse) { super(); }
}


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
    length,
}

class SaveStrategyAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'SaveStrategy';

    order = SaveStrategyOrder;

    constructor() { super(); }
}

export const SAVE_STRATEGY = '[Strategy] SAVE_STRATEGY';

export class SaveStrategyRequestAction extends SaveStrategyAction implements Action {
    readonly type = SAVE_STRATEGY;

    constructor(public payload: SaveStrategyRequest) { super(); }
}

export const SAVE_STRATEGY_FAIL = '[Strategy] SAVE_STRATEGY_FAIL';

export class SaveStrategyFailAction extends SaveStrategyAction implements Action {
    readonly type = SAVE_STRATEGY_FAIL;

    constructor(public payload: SaveStrategyResponse) { super(); }
}

export const SAVE_STRATEGY_SUCCESS = '[Strategy] SAVE_STRATEGY_SUCCESS';

export class SaveStrategySuccessAction extends SaveStrategyAction implements Action {
    readonly type = SAVE_STRATEGY_SUCCESS;

    constructor(public payload: SaveStrategyResponse) { super(); }
}


export enum StrategyListByNameOrder {
    offset,
    limit,
    strategyType,
    categoryId,
    needArgs,
    keyword,
    length,
}

export class GetStrategyListByName extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = StrategyListByNameOrder;

    command = 'GetStrategyListByName';
}

export const GET_STRATEGY_LIST_BY_NAME = '[Strategy] GET_STRATEGY_LIST_BY_NAME';

export class GetStrategyListByNameRequestAction extends GetStrategyListByName implements Action {
    readonly type = GET_STRATEGY_LIST_BY_NAME;

    constructor(public payload: GetStrategyListByNameRequest) { super(); }
}

export const GET_STRATEGY_LIST_BY_NAME_FAIL = '[Strategy] GET_STRATEGY_LIST_BY_NAME_FAIL';

export class GetStrategyListByNameFailAction extends GetStrategyListByName implements Action {
    readonly type = GET_STRATEGY_LIST_BY_NAME_FAIL;

    constructor(public payload: GetStrategyListByNameResponse) { super(); }
}

export const GET_STRATEGY_LIST_BY_NAME_SUCCESS = '[Strategy] GET_STRATEGY_LIST_BY_NAME_SUCCESS';

export class GetStrategyListByNameSuccessAction extends GetStrategyListByName implements Action {
    readonly type = GET_STRATEGY_LIST_BY_NAME_SUCCESS;

    constructor(public payload: GetStrategyListByNameResponse) { super(); }
}

export const UPDATE_STRATEGY_SECRET_KEY_STATE = '[Strategy] UPDATE_STRATEGY_SECRET_KEY_STATE';

export class UpdateStrategySecretKeyStateAction implements Action {
    readonly type = UPDATE_STRATEGY_SECRET_KEY_STATE;

    constructor(public payload: { id: number, hasToken: boolean }) { }
}

export const RESET_STATE = '[Strategy] RESET_STATE';

export class ResetStateAction implements Action {
    readonly type = RESET_STATE;
}


export const UPDATE_STRATEGY_DEPENDANCE_TEMPLATES = '[Strategy] UPDATE_STRATEGY_DEPENDANCE_TEMPLATES';

export class UpdateStrategyDependanceTemplatesAction implements Action {
    readonly type = UPDATE_STRATEGY_DEPENDANCE_TEMPLATES;

    constructor(public payload: number[]) { }
}


export const UPDATE_SELECTED_LANGUAGE = '[Strategy] UPDATE_SELECTED_LANGUAGE';

export class UpdateStrategyLanguageAction implements Action {
    readonly type = UPDATE_SELECTED_LANGUAGE;

    constructor(public payload: number) { }
}

export const SNAPSHOT_CODE = '[Strategy] SNAPSHOT_CODE';

export class SnapshotCodeAction implements Action {
    readonly type = SNAPSHOT_CODE;

    constructor(public payload: string) { }
}

export type ApiActions = GetStrategyListRequestAction
    | DeleteStrategyFailAction
    | DeleteStrategyRequestAction
    | DeleteStrategySuccessAction
    | GenKeyFailAction
    | GenKeyRequestAction
    | GenKeySuccessAction
    | GetPublicStrategyDetailFailAction
    | GetPublicStrategyDetailRequestAction
    | GetPublicStrategyDetailSuccessAction
    | GetStrategyDetailFailAction
    | GetStrategyDetailRequestAction
    | GetStrategyDetailSuccessAction
    | GetStrategyListByNameFailAction
    | GetStrategyListByNameRequestAction
    | GetStrategyListByNameSuccessAction
    | GetStrategyListFailAction
    | GetStrategyListSuccessAction
    | OpStrategyTokenFailAction
    | OpStrategyTokenRequestAction
    | OpStrategyTokenSuccessAction
    | SaveStrategyFailAction
    | SaveStrategyRequestAction
    | SaveStrategySuccessAction
    | ShareStrategyFailAction
    | ShareStrategyRequestAction
    | ShareStrategySuccessAction
    | VerifyKeyFailAction
    | VerifyKeyRequestAction
    | VerifyKeySuccessAction;

export type Actions = ApiActions
    | ResetStateAction
    | SnapshotCodeAction
    | UpdateStrategyDependanceTemplatesAction
    | UpdateStrategyLanguageAction
    | UpdateStrategySecretKeyStateAction;

export const ResponseActions = {
    GetPublicStrategyDetailRequestAction,
    GetPublicStrategyDetailSuccessAction,
    GetStrategyListFailAction,
    GetStrategyListSuccessAction,
    GetStrategyListByNameFailAction,
    GetStrategyListByNameSuccessAction,
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
};
