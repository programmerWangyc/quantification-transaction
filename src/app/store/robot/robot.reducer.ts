import { GetRobotListResponse } from '../../interfaces/response.interface';
import { ResponseState, RobotListResponse } from './../../interfaces/response.interface';
import * as actions from './robot.action';

export interface State {
    responseState: ResponseState;
    data: RobotListResponse;
}

export const initialState: State = {
    responseState: null,
    data: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        case actions.GET_ROBOT_LIST_FAIL:
            return updateRobotState(action.payload, null);

        case actions.GET_ROBOT_LIST_SUCCESS:
            return updateRobotState(action.payload, action.payload.result);

        case actions.GET_ROBOT_LIST:
        default:
            return state;
    }
}

function updateRobotState(res: GetRobotListResponse, data: RobotListResponse): State {
    return {
        responseState: {
            error: res.error,
            action: res.action,
        },
        data,
    };
}

export const getResponseState = (state: State) => state.responseState;

export const getRobotData = (state: State) => state.data;