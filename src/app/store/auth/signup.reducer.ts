import { SignupResponse } from './../../interfaces/response.interface';
import * as actions from './signup.action';

export interface State {
    username: string;
    email: string;
    refUrl: string;
    refUser: string;
    response: SignupResponse;
    isAgree: boolean;
}

export const initialState: State = {
    username: null,
    email: null,
    refUrl: null,
    refUser: null,
    response: null,
    isAgree: true,
}

export enum SingupErrorMsg {
    SIGNUP_LIMITED_PER_HOUR_ERROR = 1,
    EMAIL_NOT_EXIST_ERROR,
    EMAIL_REPEAT_ERROR,
    REFERRER_INFO_ERROR
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // signup
        case actions.SIGNUP: {
            const { username, email, refUrl, refUser } = action.payload;

            return { ...state, username, email, refUser, refUrl }
        }

        case actions.SIGNUP_FAIL: {
            const response = { ...action.payload };

            response.error = SingupErrorMsg[Math.abs(response.result)];

            return { ...state, response };
        }

        case actions.SIGNUP_SUCCESS:
            return { ...state, response: action.payload };

        // ui state
        case actions.TOGGLE_AGREE_STATE:
            return { ...state, isAgree: action.payload };
            
        default:
            return state;
    }
}

export const getSingupResponse = (state: State) => state.response;

export const getAgreeState = (state: State) => state.isAgree;