import { ResetPasswordResponse } from './../../interfaces/response.interface';
import * as actions from './reset.action';

export interface State {
    email: string;
    response: ResetPasswordResponse;
}

export const initialState: State = {
    email: null,
    response: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.RESET_PASSWORD:
            return { ...state, email: action.payload.email };

        case actions.RESET_PASSWORD_FAIL:
        case actions.RESET_PASSWORD_SUCCESS:
            return { ...state, response: action.payload };

        default:
            return state;
    }
}

export const getResetResponse = (state: State) => state.response;