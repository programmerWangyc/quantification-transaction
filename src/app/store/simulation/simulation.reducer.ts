import { GetSandboxTokenResponse } from '../../interfaces/response.interface';
import * as actions from './simulation.action';

export interface RequestParams {
}

export interface UIState {
}

export interface State {
    sandboxTokenRes: GetSandboxTokenResponse;
}

const initialState: State = {
    sandboxTokenRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        case actions.GET_SANDBOX_TOKEN_FAIL:
        case actions.GET_SANDBOX_TOKEN_SUCCESS:
            return { ...state, sandboxTokenRes: action.payload };

        case actions.GET_SANDBOX_TOKEN:
        default:
            return state;
    }
}

export const getSandboxTokenRes = (state: State) => state.sandboxTokenRes;
