import * as actions from './exchange.action';
import { ExchangeListResponse, GetExchangeListResponse, Exchange, ResponseState } from './../../interfaces/response.interface';

export interface State {
    response: ResponseState;
    list: Exchange[];
}

const initialState: State = {
    response: null,
    list: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_EXCHANGE_LIST_FAIL:
            return updateState(action.payload, null);

        case actions.GET_EXCHANGE_LIST_SUCCESS:
            return updateState(action.payload, action.payload.result.exchanges);

        case actions.GET_EXCHANGE_LIST:
        default:
            return state;
    }
}

function updateState(source: GetExchangeListResponse, data: Exchange[]): State {
    return {
        response: {
            error: source.error,
            action: source.action,
        },
        list: data
    };
}

export const getExchangeListResponseState = (state: State) => state.response;

export const getExchangeListResponse = (state: State) => state.list;