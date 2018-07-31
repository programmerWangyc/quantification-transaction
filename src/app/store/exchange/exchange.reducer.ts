import { GetExchangeListResponse, ExchangeMetaData } from '../../interfaces/response.interface';
import * as actions from './exchange.action';

export interface ExchangeConfig {
    selectedTypeId: number;
    selectedExchange: number | string;
    regionIndex?: number;
    providerIndex?: number;
    quotaServer?: string;
    tradeServer?: string;
}

export interface UIState {
    exchange: ExchangeConfig;
}

export interface State {
    exchangeListRes: GetExchangeListResponse;
    UIState: UIState;
}

const initialExchange: ExchangeConfig = {
    selectedTypeId: 0,
    selectedExchange: null,
};

const initialUIState: UIState = {
    exchange: initialExchange,
};

const initialState: State = {
    exchangeListRes: null,
    UIState: initialUIState,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // ======================================================API action===================================================

        // exchange list
        case actions.GET_EXCHANGE_LIST_FAIL:
            return { ...state, exchangeListRes: action.payload };

        case actions.GET_EXCHANGE_LIST_SUCCESS: {
            const { result } = action.payload;

            return { ...state, exchangeListRes: { ...action.payload, result: { exchanges: result.exchanges.map(item => ({ ...item, meta: <ExchangeMetaData[]>JSON.parse(<string>item.meta) })) } } };
        }

        // ======================================================Local action===================================================

        // ui state
        case actions.UPDATE_SELECTED_EXCHANGE_TYPE:
            return { ...state, UIState: { ...state.UIState, exchange: { ...initialUIState.exchange, selectedTypeId: action.payload } } };

        case actions.UPDATE_SELECTED_EXCHANGE:
            return { ...state, UIState: { ...state.UIState, exchange: { ...state.UIState.exchange, selectedExchange: action.payload } } };

        case actions.UPDATE_SELECTED_EXCHANGE_PROVIDER:
            return { ...state, UIState: { ...state.UIState, exchange: { ...state.UIState.exchange, providerIndex: action.payload } } };

        case actions.UPDATE_SELECTED_EXCHANGE_QUOTA_SERVER:
            return { ...state, UIState: { ...state.UIState, exchange: { ...state.UIState.exchange, quotaServer: action.payload } } };

        case actions.UPDATE_SELECTED_EXCHANGE_TRADE_SERVER:
            return { ...state, UIState: { ...state.UIState, exchange: { ...state.UIState.exchange, tradeServer: action.payload } } };

        case actions.UPDATE_SELECTED_EXCHANGE_REGION:
            return { ...state, UIState: { ...state.UIState, exchange: { ...state.UIState.exchange, regionIndex: action.payload } } };

        case actions.RESET_STATE:
            return { ...state, UIState: { ...state.UIState, exchange: initialExchange } };

        case actions.GET_EXCHANGE_LIST:
        default:
            return state;
    }
}

export const getExchangeListResponse = (state: State) => state.exchangeListRes;

export const getExchangeUIStateResponse = (state: State) => state.UIState;

