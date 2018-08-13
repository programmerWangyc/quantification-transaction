import { Action } from '@ngrx/store';

import { GetPaymentArgRequest } from '../../interfaces/request.interface';
import { GetPaymentArgResponse, GetPayOrdersResponse, ServerSendPaymentMessage } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

// =====================================================Server send event=========================================

// payment success
export const RECEIVE_SERVER_SEND_PAYMENT_EVENT = 'RECEIVE_SERVER_SEND_PAYMENT_EVENT';

export class ReceiveServerSendPaymentEventAction implements Action {
    readonly type = RECEIVE_SERVER_SEND_PAYMENT_EVENT;

    constructor(public payload: ServerSendPaymentMessage) { }
}

//  ===========================================Api action===================================

// pay orders
export class GetPayOrders extends ApiAction {
    isSingleParams = false;

    command = 'GetPayOrders';

    order = null;

    noneParams = true;

    constructor() { super(); }
}

export const GET_PAY_ORDERS = '[Charge] GET_PAY_ORDERS';

export class GetPayOrdersRequestAction extends GetPayOrders implements Action {
    readonly type = GET_PAY_ORDERS;

    constructor(public payload = null) { super(); }
}

export const GET_PAY_ORDERS_FAIL = '[Charge] GET_PAY_ORDERS_FAIL';

export class GetPayOrdersFailAction extends GetPayOrders implements Action {
    readonly type = GET_PAY_ORDERS_FAIL;

    constructor(public payload: GetPayOrdersResponse) { super(); }
}

export const GET_PAY_ORDERS_SUCCESS = '[Charge] GET_PAY_ORDERS_SUCCESS';

export class GetPayOrdersSuccessAction extends GetPayOrders implements Action {
    readonly type = GET_PAY_ORDERS_SUCCESS;

    constructor(public payload: GetPayOrdersResponse) { super(); }
}

// payment arg
export enum PaymentArgOrder {
    payMethod,
    strategyId,
    chargeAmount,
    length,
}

export class GetPaymentArg extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = PaymentArgOrder;

    command = 'GetPaymentArg';

    constructor() { super(); }
}

export const GET_PAYMENT_ARG = '[Charge] GET_PAYMENT_ARG';

export class GetPaymentArgRequestAction extends GetPaymentArg implements Action {
    readonly type = GET_PAYMENT_ARG;

    constructor(public payload: GetPaymentArgRequest) { super(); }
}

export const GET_PAYMENT_ARG_FAIL = '[Charge] GET_PAYMENT_ARG_FAIL';

export class GetPaymentArgFailAction extends GetPaymentArg implements Action {
    readonly type = GET_PAYMENT_ARG_FAIL;

    constructor(public payload: GetPaymentArgResponse) { super(); }
}

export const GET_PAYMENT_ARG_SUCCESS = '[Charge] GET_PAYMENT_ARG_SUCCESS';

export class GetPaymentArgSuccessAction extends GetPaymentArg implements Action {
    readonly type = GET_PAYMENT_ARG_SUCCESS;

    constructor(public payload: GetPaymentArgResponse) { super(); }
}

//  ===========================================Local action===================================

export const RESET_RECHARGE = '[Charge] RESET_RECHARGE';

export class ResetRechargeAction implements Action {
    readonly type = RESET_RECHARGE;

    constructor(public payload = null) { }
}

export type ApiActions = GetPayOrdersRequestAction
    | GetPayOrdersFailAction
    | GetPayOrdersSuccessAction
    | GetPaymentArgRequestAction
    | GetPaymentArgFailAction
    | GetPaymentArgSuccessAction;

export type Actions = ApiActions
    | ResetRechargeAction
    | ReceiveServerSendPaymentEventAction;

export const ResponseActions = {
    GetPayOrdersFailAction,
    GetPayOrdersSuccessAction,
    GetPaymentArgFailAction,
    GetPaymentArgSuccessAction,
    ReceiveServerSendPaymentEventAction,
};
