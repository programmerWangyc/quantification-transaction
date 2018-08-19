import { LoginResponse } from '../../interfaces/response.interface';
import * as actions from './login.action';

export interface State {
    username: string;
    response: LoginResponse;
    needGoogleSecondaryVerificationCode: boolean;
}

export const initialState: State = {
    username: null,
    response: null,
    needGoogleSecondaryVerificationCode: false,
};

export enum LoginErrorMsg {
    AUTHENTICATION_FAILED_ERROR = 1,
    NEED_GOOGLE_SECONDARY_VERIFICATION,
    GOOGLE_SECONDARY_VERIFICATION_CODE_ERROR,
    ACCOUNT_LOCKED_ERROR,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // login state
        case actions.LOGIN:
            return { ...state, username: action.payload.username };

        case actions.LOGIN_FAIL: {
            const response = { ...action.payload };

            const errorCode = Math.abs(action.payload.result);

            response.error = LoginErrorMsg[errorCode];

            return { ...state, response, needGoogleSecondaryVerificationCode: [LoginErrorMsg.NEED_GOOGLE_SECONDARY_VERIFICATION, LoginErrorMsg.GOOGLE_SECONDARY_VERIFICATION_CODE_ERROR].includes(errorCode) };
        }

        case actions.LOGIN_SUCCESS:
            return { ...state, response: action.payload };

        // ui state
        case actions.CLOSE_SECONDARY_VERIFY:
            return { ...state, needGoogleSecondaryVerificationCode: false };

        case actions.CLEAR_LOGIN_INFO:
            return initialState;

        default:
            return state;
    }
}

export const getUsername = (state: State) => state.username;

export const getLoginResponse = (state: State) => state.response;

export const getNeedSecondaryVer = (state: State) => state.needGoogleSecondaryVerificationCode;
