import { VerifyPasswordResponse } from './../../interfaces/response.interface';
import * as actions from './verify-password.action';

export interface State {
    response: VerifyPasswordResponse;
}

export const initialState: State = {
    response: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // verify password
        case actions.VERIFY_PASSWORD_FAIL:
        case actions.VERIFY_PASSWORD_SUCCESS:
            return { ...state, response: action.payload };

        // ui state
        case actions.RESET_VERIFY_PASSWORD:
            return { ...state, response: null };

        case actions.VERIFY_PASSWORD:
        default:
            return state;
    }
}

export const getVerifyResponse = (state: State) => state.response;