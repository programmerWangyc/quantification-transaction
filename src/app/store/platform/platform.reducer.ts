import { GetPlatformListResponse, Platform } from '../../interfaces/response.interface';
import * as actions from './platform.action';

export interface State {
    platformListRes: GetPlatformListResponse;
}

const initialState: State = {
    platformListRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_PLATFORM_LIST_FAIL:
            return { platformListRes: action.payload };

        case actions.GET_PLATFORM_LIST_SUCCESS:
            return { platformListRes: addDefaultPlatform(action.payload) };

        case actions.GET_PLATFORM_LIST:
        default:
            return state;
    }
}

export function addDefaultPlatform(data: GetPlatformListResponse): GetPlatformListResponse {
    const custom: Platform = {
        id: -1,
        eid: '16',
        label: 'BotVS',
        name: 'BotVs',
        stocks: ['BTC_USD', 'ETH_BTC', 'LTC_BTC', 'BCC_BTC'],
    };

    data.result.platforms.push(custom);

    return data;
}

export const getPlatformListResponse = (state: State) => state.platformListRes;
