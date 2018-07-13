import { GetPaymentArgRequest } from '../../interfaces/request.interface';
import { GetPaymentArgResponse, GetPayOrdersResponse, ServerSendPaymentMessage } from '../../interfaces/response.interface';
import * as actions from './charge.action';

export interface RequestParams {
    paymentArg: GetPaymentArgRequest;
}

export interface State {
    requestParams: RequestParams;
    paymentArgRes: GetPaymentArgResponse;
    payOrderRes: GetPayOrdersResponse;
    serverMessage: ServerSendPaymentMessage;
}

const initialState: State = {
    requestParams: null,
    paymentArgRes: null,
    payOrderRes: null,
    serverMessage: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        //pay orders
        case actions.GET_PAY_ORDERS_FAIL:
        case actions.GET_PAY_ORDERS_SUCCESS:
            return { ...state, payOrderRes: action.payload };

        // payment arg
        case actions.GET_PAYMENT_ARG:
            return { ...state, requestParams: { ...state.requestParams, paymentArg: action.payload } };

        case actions.GET_PAYMENT_ARG_FAIL:
        case actions.GET_PAYMENT_ARG_SUCCESS:
            return { ...state, paymentArgRes: action.payload };

        case actions.RECEIVE_SERVER_SEND_PAYMENT_EVENT:
            return { ...state, serverMessage: action.payload };
        // reset store
        case actions.RESET_RECHARGE:
            return { ...state, requestParams: null };

        case actions.GET_PAY_ORDERS:
        default:
            return state;
    }
}

export const getPayOrdersRes = (state: State) => state.payOrderRes;

export const getPaymentArgRes = (state: State) => state.paymentArgRes;

export const getRequestArgs = (state: State) => state.requestParams;

export const getServerSendMessage = (state: State) => state.serverMessage;
