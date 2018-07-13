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

    constructor() { super() };
}

export const GET_EXCHANGE_LIST = '[Exchange] GET_EXCHANGE_LIST';

export class GetExchangeListRequestAction extends GetExchangeListAction implements Action {
    readonly type = GET_EXCHANGE_LIST;

    constructor(public payload = {}) { super() }
}

export const GET_EXCHANGE_LIST_FAIL = '[Exchange] GET_EXCHANGE_LIST_FAIL';

export class GetExchangeListFailAction extends GetExchangeListAction implements Action {
    readonly type = GET_EXCHANGE_LIST_FAIL;

    constructor(public payload: GetExchangeListResponse) { super() }
}

export const GET_EXCHANGE_LIST_SUCCESS = '[Exchange] GET_EXCHANGE_LIST_SUCCESS';

export class GetExchangeListSuccessAction extends GetExchangeListAction implements Action {
    readonly type = GET_EXCHANGE_LIST_SUCCESS;

    constructor(public payload: GetExchangeListResponse) { super() }
}

//  ===========================================Local action===================================

//  none local action 

export type ApiActions = GetExchangeListRequestAction
    | GetExchangeListFailAction
    | GetExchangeListSuccessAction

export type Actions = ApiActions

export const ResponseActions = {
    GetExchangeListFailAction,
    GetExchangeListSuccessAction,
}
