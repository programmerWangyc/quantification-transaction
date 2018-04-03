import { LoginResponse } from '../../interfaces/response.interface';
import * as actions from './login.action';

export interface State {
    username: string;
    response: LoginResponse;
}

export const initialState: State = {
    username: null,
    response: null
}

export enum LoginErrorMsg {
    AUTHENTICATION_FAILED_ERROR = 1,
    NEED_GOOGLE_SECONDARY_VERIFICATION,
    GOOGLE_SECONDARY_VERIFICATION_CODE_ERROR,
    ACCOUNT_LOCKED_ERROR
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // login state
        case actions.LOGIN:
            return { ...state, username: action.payload.username };

        case actions.LOGIN_FAIL: {
            const response = { ...action.payload };

            response.error = LoginErrorMsg[Math.abs(action.payload.result)];

            return { ...state, response };
        }

        case actions.LOGIN_SUCCESS:
            return { ...state, response: action.payload };

        // ui state
        case actions.RESET_LOGIN_ERROR:
            return { ...state, response: { ...state.response, error: null } };

        default:
            return state;
    }
}

export const getUsername = (state: State) => state.username;

export const getLoginResponse = (state: State) => state.response;
