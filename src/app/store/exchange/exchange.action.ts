import { Action } from '@ngrx/store';

import { GetExchangeListResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

// exchange list
export class GetExchangeListAction extends ApiAction {
    isSingleParams = false;

    command = 'GetExchangeList';

    order = null;

    noneParams = true;

    allowSeparateRequest = true;

    constructor() { super(); }
}

export const GET_EXCHANGE_LIST = '[Exchange] GET_EXCHANGE_LIST';

export class GetExchangeListRequestAction extends GetExchangeListAction implements Action {
    readonly type = GET_EXCHANGE_LIST;

    constructor(public payload = {}) { super(); }
}

export const GET_EXCHANGE_LIST_FAIL = '[Exchange] GET_EXCHANGE_LIST_FAIL';

export class GetExchangeListFailAction extends GetExchangeListAction implements Action {
    readonly type = GET_EXCHANGE_LIST_FAIL;

    constructor(public payload: GetExchangeListResponse) { super(); }
}

export const GET_EXCHANGE_LIST_SUCCESS = '[Exchange] GET_EXCHANGE_LIST_SUCCESS';

export class GetExchangeListSuccessAction extends GetExchangeListAction implements Action {
    readonly type = GET_EXCHANGE_LIST_SUCCESS;

    constructor(public payload: GetExchangeListResponse) { super(); }
}

//  ===========================================Local action===================================

export const UPDATE_SELECTED_EXCHANGE_TYPE = '[Exchange] UPDATE_SELECTED_EXCHANGE_TYPE';

export class UpdateSelectedExchangeTypeAction implements Action {
    readonly type = UPDATE_SELECTED_EXCHANGE_TYPE;

    constructor(public payload: number) { }
}

export const UPDATE_SELECTED_EXCHANGE = '[Exchange] UPDATE_SELECTED_EXCHANGE';

export class UpdateSelectedExchangeAction implements Action {
    readonly type = UPDATE_SELECTED_EXCHANGE;

    constructor(public payload: number | string) { }
}

export const UPDATE_SELECTED_EXCHANGE_REGION = '[Exchange] UPDATE_SELECTED_EXCHANGE_REGION';

export class UpdateSelectedExchangeRegionAction implements Action {
    readonly type = UPDATE_SELECTED_EXCHANGE_REGION;

    constructor(public payload: number) { }
}

export const UPDATE_SELECTED_EXCHANGE_PROVIDER = '[Exchange] UPDATE_SELECTED_EXCHANGE_PROVIDER';

export class UpdateSelectedExchangeProviderAction implements Action {
    readonly type = UPDATE_SELECTED_EXCHANGE_PROVIDER;

    constructor(public payload: number) { }
}

export const UPDATE_SELECTED_EXCHANGE_QUOTA_SERVER = '[Exchange] UPDATE_SELECTED_EXCHANGE_QUOTA_SERVER';

export class UpdateSelectedExchangeQuotaServerAction implements Action {
    readonly type = UPDATE_SELECTED_EXCHANGE_QUOTA_SERVER;

    constructor(public payload: number) { }
}

export const UPDATE_SELECTED_EXCHANGE_TRADE_SERVER = '[Exchange] UPDATE_SELECTED_EXCHANGE_TRADE_SERVER';

export class UpdateSelectedExchangeTradeServerAction implements Action {
    readonly type = UPDATE_SELECTED_EXCHANGE_TRADE_SERVER;

    constructor(public payload: number) { }
}


export type ApiActions = GetExchangeListRequestAction
    | GetExchangeListFailAction
    | GetExchangeListSuccessAction;

export type Actions = ApiActions
    | UpdateSelectedExchangeAction
    | UpdateSelectedExchangeProviderAction
    | UpdateSelectedExchangeQuotaServerAction
    | UpdateSelectedExchangeRegionAction
    | UpdateSelectedExchangeTradeServerAction
    | UpdateSelectedExchangeTypeAction;

export const ResponseActions = {
    GetExchangeListFailAction,
    GetExchangeListSuccessAction,
};
