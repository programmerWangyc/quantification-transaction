import { Action } from '@ngrx/store';

import { GetStrategyListRequest } from '../../interfaces/request.interface';
import { ApiAction } from '../base.action';
import { GetStrategyListResponse } from './../../interfaces/response.interface';

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

export const GET_STRATEGY_LIST = 'GET_STRATEGY_LIST';

export class GetStrategyListRequestAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST;

    allowSeparateRequest = false;

    constructor(public payload: GetStrategyListRequest) { super() }
}

export const GET_STRATEGY_LIST_FAIL = 'GET_STRATEGY_LIST_FAIL';

export class GetStrategyListFailAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST_FAIL;

    constructor(public payload: GetStrategyListResponse) { super() }
}

export const GET_STRATEGY_LIST_SUCCESS = 'GET_STRATEGY_LIST_SUCCESS';

export class GetStrategyListSuccessAction extends GetStrategyList implements Action {
    readonly type = GET_STRATEGY_LIST_SUCCESS;

    constructor(public payload: GetStrategyListResponse) { super() }
}

/* ===========================================Local action=================================== */

/* none local action */

export type ApiActions = GetStrategyListRequestAction
    | GetStrategyListFailAction
    | GetStrategyListSuccessAction

export type Actions = ApiActions

export const ResponseActions = {
    GetStrategyListFailAction,
    GetStrategyListSuccessAction,
}
