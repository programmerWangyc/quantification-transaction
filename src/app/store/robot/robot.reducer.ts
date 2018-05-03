import { partition } from 'lodash';

import { ModifyRobotRequest, PublicRobotRequest, CommandRobotRequest } from '../../interfaces/request.interface';
import {
    GetRobotListResponse,
    ModifyRobotResponse,
    RestartRobotResponse,
    StopRobotResponse,
    CommandRobotResponse,
} from '../../interfaces/response.interface';
import { ENCRYPT_PREFIX, LIST_PREFIX } from '../../providers/constant.service';
import { ImportedArg, TemplateVariableOverview, VariableOverview } from './../../interfaces/constant.interface';
import {
    GetRobotDetailRequest,
    GetRobotLogsRequest,
    RestartRobotRequest,
    StopRobotRequest,
    SubscribeRobotRequest,
} from './../../interfaces/request.interface';
import {
    GetRobotDetailResponse,
    GetRobotLogsResponse,
    PublicRobotResponse,
    ResponseState,
    RobotListResponse,
    SubscribeRobotResponse,
} from './../../interfaces/response.interface';
import { COMMAND_PREFIX } from './../../providers/constant.service';
import * as actions from './robot.action';

interface RequestParams {
    publicRobot: PublicRobotRequest;
    robotDetail: GetRobotDetailRequest;
    subscribeRobot: SubscribeRobotRequest;
    robotLogs: GetRobotLogsRequest;
    restartRobot: RestartRobotRequest;
    stopRobot: StopRobotRequest;
    modifyRobot: ModifyRobotRequest;
    commandRobot: CommandRobotRequest;
}

interface RobotArgs {
    strategyArgs: VariableOverview[];
    commandArgs: VariableOverview[];
    templateArgs: TemplateVariableOverview[];
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
    robotArgs: RobotArgs; // created by 'strategy_args' and 'templates' field belongs to robot detail response;
    modifyRobotConfigRes: ModifyRobotResponse;
    commandRobotRes: CommandRobotResponse;
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
    robotArgs: null,
    modifyRobotConfigRes: null,
    commandRobotRes: null,
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
            return {
                ...state,
                robotDetailRes: action.payload,
                robotArgs: {
                    ...state.robotArgs,
                    strategyArgs: null,
                    templateArgs: null,
                }
            };

        case actions.GET_ROBOT_DETAIL_SUCCESS: {
            const { strategy_args, templates } = action.payload.result.robot;

            const [strategyArgs, commandArgs] = partition(createScriptArgs(JSON.parse(strategy_args)), arg => arg.variableName.indexOf(COMMAND_PREFIX) < 0);

            return {
                ...state,
                robotDetailRes: action.payload,
                robotArgs: {
                    ...state.robotArgs,
                    strategyArgs,
                    commandArgs,
                    templateArgs: templates.map(template => {
                        const { id, name, category } = template;

                        const variables = createScriptArgs(JSON.parse(template.args))

                        return { id, name, category, variables };
                    })
                }
            };

        }
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
        case actions.RESTART_ROBOT:
            return { ...state, isLoading: true, requestParams: { ...state.requestParams, restartRobot: { ...action.payload } } };

        case actions.RESTART_ROBOT_FAIL:
            return { ...state, isLoading: false, restartRobotRes: action.payload };

        case actions.RESTART_ROBOT_SUCCESS: {
            const status = <number>action.payload.result;

            const robotDetailRes = { ...state.robotDetailRes, result: { robot: { ...state.robotDetailRes.result.robot, status } } };

            // 直接从URL上访问这机器页面时，state.robotList会报 can't read property 'robots' of null 错误。
            const robotList = { ...state.robotList, robots: state.robotList.robots.map(item => item.id === state.requestParams.restartRobot.id ? { ...item, status } : item) };

            return { ...state, isLoading: false, restartRobotRes: action.payload, robotDetailRes, robotList };
        }

        // stop robot
        case actions.STOP_ROBOT:
            return { ...state, isLoading: true, requestParams: { ...state.requestParams, stopRobot: { ...action.payload } } };

        case actions.STOP_ROBOT_FAIL:
            return { ...state, isLoading: false, stopRobotRes: action.payload };

        case actions.STOP_ROBOT_SUCCESS: {
            const status = <number>action.payload.result;

            const robotDetailRes = { ...state.restartRobotRes, result: { robot: { ...state.robotDetailRes.result.robot, status, wd: 0 } } };

            const robotList = { ...state.robotList, robots: state.robotList.robots.map(item => item.id === state.requestParams.restartRobot.id ? { ...item, status, wd: 0 } : item) };

            return { ...state, isLoading: false, stopRobotRes: action.payload, robotDetailRes, robotList };
        }

        // modify robot config
        case actions.MODIFY_ROBOT:
            return { ...state, requestParams: { ...state.requestParams, modifyRobot: action.payload } };

        case actions.MODIFY_ROBOT_FAIL:
        case actions.MODIFY_ROBOT_SUCCESS:
            return { ...state, modifyRobotConfigRes: action.payload };

        // command robot config;
        case actions.COMMAND_ROBOT:
            return { ...state, requestParams: { ...state.requestParams, commandRobot: action.payload}};

        case actions.COMMAND_ROBOT_FAIL:
        case actions.COMMAND_ROBOT_SUCCESS:
            return { ...state, commandRobotRes: action.payload };

        /** ==============================================Local action===================================================== **/

        // strategy arguments
        case actions.MODIFY_ROBOT_ARG: {
            let robotArgs = null;

            if (!!action.templateFlag) { // update module args;
                robotArgs = { ...state.robotArgs, templateArgs: updateTemplateArg(state.robotArgs.templateArgs, action.payload, action.templateFlag) };
            } else if (action.payload.variableName.indexOf(COMMAND_PREFIX) === 0) { // update command args;
                robotArgs = { ...state.robotArgs, commandArgs: updateArg(state.robotArgs.commandArgs, action.payload) };
            } else { // update strategy args;
                robotArgs = { ...state.robotArgs, strategyArgs: updateArg(state.robotArgs.strategyArgs, action.payload) };
            }

            return { ...state, robotArgs };
        }

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

function updateArg(args: VariableOverview[], target: VariableOverview | ImportedArg): VariableOverview[] {
    const index = args.findIndex(item => item.variableName === target.variableName);

    const { variableName, variableValue } = target;

    args[index] = { ...args[index], variableName, variableValue };

    return [...args];
}

function updateTemplateArg(args: TemplateVariableOverview[], data: VariableOverview | ImportedArg, templateFlag: string | number): TemplateVariableOverview[] {
    const target = args.find(item => item.name === templateFlag || item.id === templateFlag);

    target.variables = updateArg(target.variables, data);

    return [...args];
}

/**
 * @function createScriptArgs;
 * @param args Strategy args or template args; 
 * @description This method used for translate the JSON type args to dictionary type, and finally flatten the two-dimensional arry.
 */
function createScriptArgs(args: (string | number)[][]): VariableOverview[] {
    return args.map(ary => {
        const variable = completionParams(ary);

        const variableTypeId = getArgId(variable.variableValue);

        return { ...variable, variableTypeId };
    });
}


/**
 * @description Converting data structure from array to dictionary; 
 */
function completionParams(arg: (string | number)[]): VariableOverview {
    if (arg.length === 3) {
        const [name, des, variableValue] = arg;

        return {
            variableName: <string>name,
            variableDes: <string>des,
            variableValue,
            variableComment: '',
            variableTypeId: undefined,
            originValue: variableValue,
        };
    } else {
        const [name, des, comment, variableValue] = arg;

        return {
            variableName: <string>name,
            variableDes: <string>des,
            variableValue,
            variableComment: <string>comment,
            variableTypeId: undefined,
            originValue: variableValue,
        };
    };
}

function getArgId(value: string | boolean | number): number {
    if (typeof value === 'number') {
        return 0;
    } else if (typeof value === 'boolean') {
        return 1;
    } else if (value.indexOf(LIST_PREFIX) === 0) {
        return 3;
    } else if (value.indexOf(ENCRYPT_PREFIX) === 0) {
        return 4;
    } else if (value === '__button__') {
        return 5;
    } else {
        return 2;
    }
}

// 搞不清这个函数里的条件对应的业务场景
function isConditionCreateByRobotArgsAndTemplateIdCombination(arg: any[], comparisonName: string, templateId?: number): boolean {
    return arg[0] === comparisonName && !templateId || arg.length === 2 && templateId == -1 || arg.length === 3 && arg[2] === templateId;
}

function updateVariableName(arg: VariableOverview): VariableOverview {
    let { variableName } = arg;

    if (variableName.indexOf(COMMAND_PREFIX) === 0) {
        variableName = variableName.split(COMMAND_PREFIX)[1];
    } else {
        /**
         * no thing to do;
         */
    }

    return { ...arg, variableName };
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

export const getRobotArgs = (state: State) => state.robotArgs;

export const getModifyRobotRes = (state: State) => state.modifyRobotConfigRes;

export const getCommandRobotRes = (state: State) => state.commandRobotRes;