import { VerifyPasswordResponse } from '../../interfaces/response.interface';
import * as actions from './verify-password.action';

export interface State {
    response: VerifyPasswordResponse;
    request: string;
}

export const initialState: State = {
    response: null,
    request: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // verify password
        case actions.VERIFY_PASSWORD_FAIL: {
            const payload = action.payload;

            return { ...state, response: { result: payload.result, action: payload.action, error: 'PASSWORD_VERIFY_FAILED' }, request: null };
        }

        case actions.VERIFY_PASSWORD_SUCCESS:
            return { ...state, response: action.payload };

        // ui state
        case actions.STORE_PWD_TEMPORARY:
            return { ...state, request: action.payload };

        case actions.RESET_VERIFY_PASSWORD:
            return { ...state, response: null };

        default:
            return state;
    }
}

export const getVerifyResponse = (state: State) => state.response;

export const getTemporaryPwd = (state: State) => state.request;
