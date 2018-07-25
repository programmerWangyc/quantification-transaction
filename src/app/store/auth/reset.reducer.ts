import { ResetPasswordResponse } from '../../interfaces/response.interface';
import * as actions from './reset.action';

export interface State {
    email: string;
    response: ResetPasswordResponse;
}

export const initialState: State = {
    email: null,
    response: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // reset password
        case actions.RESET_PASSWORD:
            return { ...state, email: action.payload.email };

        case actions.RESET_PASSWORD_FAIL:
        case actions.RESET_PASSWORD_SUCCESS:
            return { ...state, response: action.payload };

        // ui state
        case actions.RESET_RESET_PASSWORD:
            return { ...state, response: null };

        default:
            return state;
    }
}

export const getResetResponse = (state: State) => state.response;
