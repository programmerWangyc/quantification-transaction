import { SetRobotWDRequest } from '../../interfaces/request.interface';
import { SetRobotWDResponse } from './../../interfaces/response.interface';
import * as actions from './watch-dog.action';

export interface State {
    request: SetRobotWDRequest;
    response: SetRobotWDResponse;
}

const initialState: State = {
    request: null,
    response: null,
}

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