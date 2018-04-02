import { SetPasswordResponse } from './../../interfaces/response.interface';
import * as actions from './password.action';

export interface State {
    response: SetPasswordResponse;
}

export const initialState: State = {
    response: null
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.SET_PASSWORD_FAIL:
        case actions.SET_PASSWORD_SUCCESS:
            return { response: action.payload };

        case actions.SET_PASSWORD:
        default:
            return state;
    }
}

export const getSetPwdResponse = (state: State) => state.response;