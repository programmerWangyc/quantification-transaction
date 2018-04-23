import { GetPlatformListResponse } from './../../interfaces/response.interface';
import * as actions from './platform.action';

export interface State {
    platformListRes: GetPlatformListResponse;
}

const initialState: State = {
    platformListRes: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_PLATFORM_LIST_FAIL:
        case actions.GET_PLATFORM_LIST_SUCCESS:
            return { platformListRes: action.payload };

        case actions.GET_PLATFORM_LIST:
        default:
            return state;
    }
}

export const getPlatformListResponse = (state: State) => state.platformListRes;