import { SetWDRequest } from '../../interfaces/request.interface';
import { SetWDResponse } from '../../interfaces/response.interface';
import * as actions from './watch-dog.action';

export interface State {
    request: SetWDRequest;
    response: SetWDResponse;
}

const initialState: State = {
    request: null,
    response: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.SET_ROBOT_WATCH_DOG:
            return { ...state, request: action.payload };

        case actions.SET_ROBOT_WATCH_DOG_FAIL:
        case actions.SET_ROBOT_WATCH_DOG_SUCCESS:
            return { ...state, response: action.payload };

        default:
            return state;
    }
}

export const getSetWDResponse = (state: State) => state.response;

export const getSetWDRequest = (state: State) => state.request;
