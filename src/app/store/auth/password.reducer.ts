import { SetPasswordResponse } from '../../interfaces/response.interface';
import * as actions from './password.action';

export interface State {
    response: SetPasswordResponse;
}

export const initialState: State = {
    response: null
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // set password
        case actions.SET_PASSWORD_FAIL:
        case actions.SET_PASSWORD_SUCCESS:
            return { response: action.payload };

        // ui state
        case actions.RESET_SET_PASSWORD:
            return { response: null };
            
        case actions.SET_PASSWORD:
        default:
            return state;
    }
}

export const getSetPwdResponse = (state: State) => state.response;