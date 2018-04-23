import { PublicRobotRequest } from '../../interfaces/request.interface';
import { GetRobotListResponse, RestartRobotResponse, StopRobotResponse } from '../../interfaces/response.interface';
import { GetRobotDetailRequest, GetRobotLogsRequest, SubscribeRobotRequest } from './../../interfaces/request.interface';
import {
    GetRobotDetailResponse,
    GetRobotLogsResponse,
    PublicRobotResponse,
    ResponseState,
    RobotListResponse,
    SubscribeRobotResponse,
} from './../../interfaces/response.interface';
import * as actions from './robot.action';

interface RequestParams {
    publicRobot: PublicRobotRequest;
    robotDetail: GetRobotDetailRequest;
    subscribeRobot: SubscribeRobotRequest;
    robotLogs: GetRobotLogsRequest;
}
export interface State {
    robotListResState: ResponseState;
    robotList: RobotListResponse;
    requestParams: RequestParams;
    publicRobotRes: PublicRobotResponse;
    robotDetailRes: GetRobotDetailResponse;
    subscribeDetailRes: SubscribeRobotResponse;
    robotLogsRes: GetRobotLogsResponse;
    restartRobotRes: RestartRobotResponse;
    stopRobotRes: StopRobotResponse;
    isLoading: boolean;
}

const initialState: State = {
    robotListResState: null,
    robotList: null,
    requestParams: null,
    publicRobotRes: null,
    robotDetailRes: null,
    subscribeDetailRes: null,
    robotLogsRes: null,
    isLoading: false,
    restartRobotRes: null,
    stopRobotRes: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // robot list
        case actions.GET_ROBOT_LIST_FAIL:
            return { ...state, ...updateRobotState(action.payload, null) };

        case actions.GET_ROBOT_LIST_SUCCESS:
            return { ...state, ...updateRobotState(action.payload, action.payload.result) };

        // public robot
        case actions.PUBLIC_ROBOT:
            return {
                ...state,
                requestParams: {
                    ...state.requestParams,
                    publicRobot: action.payload
                }
            }

        case actions.PUBLIC_ROBOT_FAIL:
            return { ...state, publicRobotRes: action.payload };

        case actions.PUBLIC_ROBOT_SUCCESS: {
            const { id, type } = state.requestParams.publicRobot;

            const robot = state.robotList.robots.find(item => item.id === id);

            if (action.payload.result) robot.public = type;

            const robotList = { ...state.robotList };

            return { ...state, publicRobotRes: action.payload, robotList };
        }

        // robot detail
        case actions.GET_ROBOT_DETAIL: {
            const requestParams = { ...state.requestParams, robotDetail: action.payload };

            return { ...state, requestParams };
        }

        case actions.GET_ROBOT_DETAIL_FAIL:
        case actions.GET_ROBOT_DETAIL_SUCCESS:
            return { ...state, robotDetailRes: action.payload };

        // subscribe robot
        case actions.SUBSCRIBE_ROBOT: {
            const requestParams = { ...state.requestParams, subscribeRobot: action.payload };

            return { ...state, requestParams };
        }

        case actions.SUBSCRIBE_ROBOT_FAIL:
        case actions.SUBSCRIBE_ROBOT_SUCCESS:
            return { ...state, subscribeDetailRes: action.payload };

        // robot logs
        case actions.GET_ROBOT_LOGS: {
            const requestParams = { ...state.requestParams, robotLogs: action.payload };

            return { ...state, requestParams };
        }

        case actions.GET_ROBOT_LOGS_FAIL:
        case actions.GET_ROBOT_LOGS_SUCCESS:
            return { ...state, robotLogsRes: action.payload };

        // restart robot
        case actions.RESTART_ROBOT_FAIL:
        case actions.RESTART_ROBOT_SUCCESS:
            return { ...state, isLoading: false, restartRobotRes: action.payload };

        // stop robot
        case actions.STOP_ROBOT_FAIL:
        case actions.STOP_ROBOT_SUCCESS:
            return { ...state, isLoading: false, stopRobotRes: action.payload };

        // loading state
        case actions.RESTART_ROBOT:
        case actions.STOP_ROBOT:
            return { ...state, isLoading: true };

        // state clear
        case actions.RESET_ROBOT_DETAIL:
            return { ...state, robotDetailRes: null, restartRobotRes: null };

        case actions.GET_ROBOT_LIST:
        default:
            return state;
    }
}

function updateRobotState(res: GetRobotListResponse, robotList: RobotListResponse): { robotListResState, robotList } {
    return {
        robotListResState: {
            error: res.error,
            action: res.action,
        },
        robotList,
    };
}

export const getRobotListResState = (state: State) => state.robotListResState;

export const getRobotData = (state: State) => state.robotList;

export const getPublicRobotRes = (state: State) => state.publicRobotRes;

export const getRobotDetailRes = (state: State) => state.robotDetailRes;

export const getSubscribeRobotRes = (state: State) => state.subscribeDetailRes;

export const getRobotLogsRes = (state: State) => state.robotLogsRes;

export const getLoadingState = (state: State) => state.isLoading;

export const getRestartRobotRes = (state: State) => state.restartRobotRes;

export const getStopRobotRes = (state: State) => state.stopRobotRes;