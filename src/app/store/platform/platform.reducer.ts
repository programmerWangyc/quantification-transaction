import {
    DeletePlatformRequest, GetPlatformDetailRequest, SavePlatformRequest
} from '../../interfaces/request.interface';
import {
    DeletePlatformResponse, GetPlatformDetailResponse, GetPlatformListResponse, Platform, SavePlatformResponse
} from '../../interfaces/response.interface';
import * as actions from './platform.action';

export interface PlatformRequest {
    delete: DeletePlatformRequest;
    update: SavePlatformRequest;
    detail: GetPlatformDetailRequest;
}

export interface State {
    platformListRes: GetPlatformListResponse;
    deletePlatformRes: DeletePlatformResponse;
    requestParams: PlatformRequest;
    isLoading: boolean;
    updatePlatformRes: SavePlatformResponse;
    platformDetailRes: GetPlatformDetailResponse;
}

const initialState: State = {
    platformListRes: null,
    requestParams: {
        delete: null,
        update: null,
        detail: null,
    },
    isLoading: false,
    deletePlatformRes: null,
    updatePlatformRes: null,
    platformDetailRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // platform list
        case actions.GET_PLATFORM_LIST:
            return { ...state, isLoading: true };

        case actions.GET_PLATFORM_LIST_FAIL:
            return { ...state, platformListRes: action.payload, isLoading: false };

        case actions.GET_PLATFORM_LIST_SUCCESS:
            return { ...state, platformListRes: addDefaultPlatform(action.payload), isLoading: false };

        // delete platform
        case actions.DELETE_PLATFORM:
            return { ...state, requestParams: { ...state.requestParams, delete: action.payload } };

        case actions.DELETE_PLATFORM_FAIL:
            return { ...state, deletePlatformRes: action.payload };

        case actions.DELETE_PLATFORM_SUCCESS:
            return { ...state, deletePlatformRes: action.payload, platformListRes: { ...state.platformListRes, result: { platforms: state.platformListRes.result.platforms.filter(platform => platform.id !== state.requestParams.delete.id) } } };

        // update platform
        case actions.UPDATE_PLATFORM:
            return { ...state, requestParams: { ...state.requestParams, update: action.payload } };

        case actions.UPDATE_PLATFORM_FAIL:
        case actions.UPDATE_PLATFORM_SUCCESS:
            return { ...state, updatePlatformRes: action.payload };

        // platform detail
        case actions.GET_PLATFORM_DETAIL:
            return { ...state, requestParams: { ...state.requestParams, detail: action.payload } };

        case actions.GET_PLATFORM_DETAIL_FAIL:
        case actions.GET_PLATFORM_DETAIL_SUCCESS:
            return { ...state, platformDetailRes: action.payload };

        default:
            return state;
    }
}

/**
 * 添加 platform 常量；
 */
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

export const getPlatformIsLoading = (state: State) => state.isLoading;

export const getPlatformDeleteRes = (state: State) => state.deletePlatformRes;

export const getPlatformRequests = (state: State) => state.requestParams;

export const getUpdatePlatformRes = (state: State) => state.updatePlatformRes;

export const getPlatformDetailRes = (state: State) => state.platformDetailRes;
