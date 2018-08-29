import { cloneDeep, partition } from 'lodash';

import { TemplateVariableOverview, VariableOverview } from '../../interfaces/app.interface';
import {
    CommandRobotRequest, DeleteRobotRequest, GetPublicRobotListRequest, GetRobotDetailRequest, GetRobotLogsRequest,
    ModifyRobotRequest, PluginRunRequest, PublicRobotRequest, RestartRobotRequest, SaveRobotRequest, StopRobotRequest,
    SubscribeRobotRequest
} from '../../interfaces/request.interface';
import {
    CommandRobotResponse, DeleteRobotResponse, GetPublicRobotListResponse, GetRobotDetailResponse, GetRobotLogsResponse,
    LogOverview, ModifyRobotResponse, PluginRunResponse, ProfitLog, PublicRobotResponse, ResponseState,
    RestartRobotResponse, RobotListResponse, RunningLog, SaveRobotResponse, SemanticsLogsOverview,
    ServerSendRobotMessage, StopRobotResponse, StrategyLog, SubscribeRobotResponse
} from '../../interfaces/response.interface';
import {
    COMMAND_PREFIX, ENCRYPT_PREFIX, LIST_PREFIX, VALUE_OF_BUTTON_TYPE_ARG
} from '../../providers/constant.service';
import { getRunningLogs } from '../../providers/util.service';
import { ServerSendRobotEventType } from '../../robot/robot.config';
import { ImportedArg } from '../../robot/robot.interface';
import * as actions from './robot.action';

interface LatestRobotInfo extends ServerSendRobotMessage {
    wd?: number;
    node_id?: number;
}

export const OPERATE_ROBOT_REQUEST_TAIL = 'Robot';

export enum RobotOperateType {
    stop = 'stop',
    restart = 'restart',
    delete = 'delete',
    public = 'public',
    debug = 'debug',
}

interface RequestParams {
    commandRobot: CommandRobotRequest;
    deleteRobot: DeleteRobotRequest;
    isSyncLogs: boolean;
    modifyRobot: ModifyRobotRequest;
    pluginRun: PluginRunRequest;
    publicRobotList: GetPublicRobotListRequest;
    publicRobot: PublicRobotRequest;
    restartRobot: RestartRobotRequest;
    robotDetail: GetRobotDetailRequest;
    robotLogs: GetRobotLogsRequest;
    saveRobot: SaveRobotRequest;
    stopRobot: StopRobotRequest;
    subscribeRobot: SubscribeRobotRequest;
}

interface DefaultParams {
    PROFIT_MAX_POINTS: number;
    STRATEGY_MAX_POINTS: number;
    robotLogs: GetRobotLogsRequest;
}

interface RobotArgs {
    commandArgs: VariableOverview[];
    strategyArgs: VariableOverview[];
    templateArgs: TemplateVariableOverview[];
}

export const OPERATE_ROBOT_LOADING_TAIL = 'RobotLoading';

interface UIState {
    currentProfitChartPage: number;
    currentRunningLogPage: number;
    currentStrategyChartPage: number;
    debugRobotLoading: boolean;
    loading: boolean;
    logsLoading: boolean;
    publicRobotLoading: boolean;
    restartRobotLoading: boolean;
    stopRobotLoading: boolean;
}

export interface MonitoringSound {
    isMonitorOpen: boolean;
    logTypes: number[];
}

export interface State {
    UIState: UIState;
    commandRobotRes: CommandRobotResponse;
    defaultParams: DefaultParams;
    deleteRobotRes: DeleteRobotResponse;
    modifyRobotConfigRes: ModifyRobotResponse;
    monitoringSound: MonitoringSound;
    pluginRunRes: PluginRunResponse;
    publicRobotListRes: GetPublicRobotListResponse;
    publicRobotRes: PublicRobotResponse;
    requestParams: RequestParams;
    restartRobotRes: RestartRobotResponse;
    robotArgs: RobotArgs; // created by 'strategy_args' and 'templates' field belongs to robot detail response;
    robotDetailRes: GetRobotDetailResponse;
    robotList: RobotListResponse;
    robotListResState: ResponseState;
    robotLogsRes: GetRobotLogsResponse;
    saveRobotRes: SaveRobotResponse;
    serverMessage: ServerSendRobotMessage;
    stopRobotRes: StopRobotResponse;
    subscribeDetailRes: SubscribeRobotResponse;
    syncRobotLogsRes: GetRobotLogsResponse;
}

const robotLogsDefaultParams = {
    robotId: NaN,
    // Log
    logMinId: 0,
    logMaxId: 0,
    logOffset: 0,
    logLimit: 20,
    // Profit
    profitMinId: 0,
    profitMaxId: 0,
    profitOffset: 0,
    profitLimit: 1000,
    // Chart
    chartMinId: 0,
    chartMaxId: 0,
    chartOffset: 0,
    chartLimit: 1000,
    chartUpdateBaseId: 0,
    chartUpdateTime: 0,
};

const initialDefaultParams: DefaultParams = {
    robotLogs: { ...robotLogsDefaultParams },
    PROFIT_MAX_POINTS: 1000,
    STRATEGY_MAX_POINTS: 1000,
};

const initialMonitoringSound: MonitoringSound = {
    isMonitorOpen: false,
    logTypes: [],
};

const initialUIState: UIState = {
    currentProfitChartPage: 0,
    currentRunningLogPage: 0,
    currentStrategyChartPage: 0,
    debugRobotLoading: false,
    loading: false,
    logsLoading: false,
    publicRobotLoading: false,
    restartRobotLoading: false,
    stopRobotLoading: false,
};

const initialState: State = {
    UIState: initialUIState,
    commandRobotRes: null,
    defaultParams: initialDefaultParams,
    deleteRobotRes: null,
    modifyRobotConfigRes: null,
    monitoringSound: initialMonitoringSound,
    pluginRunRes: null,
    publicRobotListRes: null,
    publicRobotRes: null,
    requestParams: null,
    restartRobotRes: null,
    robotArgs: null,
    robotDetailRes: null,
    robotList: null,
    robotListResState: null,
    robotLogsRes: null,
    saveRobotRes: null,
    serverMessage: null,
    stopRobotRes: null,
    subscribeDetailRes: null,
    syncRobotLogsRes: null,
};

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {
        // robot list
        case actions.GET_ROBOT_LIST:
            return { ...state, UIState: { ...state.UIState, loading: true } };

        case actions.GET_ROBOT_LIST_FAIL:
            return { ...state, robotListResState: { error: action.payload.error, action: action.payload.action }, robotList: null, UIState: { ...state.UIState, loading: false } };

        case actions.GET_ROBOT_LIST_SUCCESS:
            return { ...state, robotListResState: { error: action.payload.error, action: action.payload.action }, robotList: action.payload.result, UIState: { ...state.UIState, loading: false } };

        // public robot list
        case actions.GET_PUBLIC_ROBOT_LIST:
            return { ...state, UIState: { ...state.UIState, loading: true }, requestParams: { ...state.requestParams, publicRobotList: action.payload } };

        case actions.GET_PUBLIC_ROBOT_LIST_FAIL:
            return { ...state, publicRobotListRes: action.payload, UIState: { ...state.UIState, loading: false } };

        case actions.GET_PUBLIC_ROBOT_LIST_SUCCESS:
            // return { ...state, publicRobotListRes: optimizePublicRobotList(action.payload), UIState: { ...state.UIState, loading: false } };
            return { ...state, publicRobotListRes: action.payload, UIState: { ...state.UIState, loading: false } };

        // public robot
        case actions.PUBLIC_ROBOT:
            return {
                ...state,
                requestParams: {
                    ...state.requestParams,
                    publicRobot: action.payload,
                },
                UIState: { ...state.UIState, publicRobotLoading: true },
            };

        case actions.PUBLIC_ROBOT_FAIL:
            return { ...state, publicRobotRes: action.payload, UIState: { ...state.UIState, publicRobotLoading: false } };

        case actions.PUBLIC_ROBOT_SUCCESS: {
            const { id, type } = state.requestParams.publicRobot;

            const robot = state.robotList.robots.find(item => item.id === id);

            if (action.payload.result) robot.public = type;

            const robotList = { ...state.robotList };

            return { ...state, publicRobotRes: action.payload, robotList, UIState: { ...state.UIState, publicRobotLoading: false } };
        }

        // robot detail
        case actions.GET_ROBOT_DETAIL:
            return { ...state, requestParams: { ...state.requestParams, robotDetail: action.payload }, UIState: { ...state.UIState, loading: true } };

        case actions.GET_ROBOT_DETAIL_FAIL:
            return { ...state, robotDetailRes: action.payload, robotArgs: { ...state.robotArgs, strategyArgs: null, templateArgs: null }, UIState: { ...state.UIState, loading: false } };

        case actions.GET_ROBOT_DETAIL_SUCCESS: {
            const { strategy_args, templates } = action.payload.result.robot;

            const [strategyArgs, commandArgs] = partition(createScriptArgs(JSON.parse(strategy_args || '[]')), arg => arg.variableName.indexOf(COMMAND_PREFIX) < 0);

            return {
                ...state,
                robotDetailRes: action.payload,
                robotArgs: {
                    ...state.robotArgs,
                    strategyArgs,
                    commandArgs,
                    templateArgs: (templates || []).map(template => {
                        const { id, name, category } = template;

                        const variables = createScriptArgs(JSON.parse(template.args || '[]'));

                        return { id, name, category, variables };
                    }),
                },
                UIState: {
                    ...state.UIState,
                    loading: false,
                },
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
            if (action.isSyncAction) {
                const requestParams = { ...state.requestParams, isSyncLogs: true };

                return { ...state, requestParams };
            } else {
                const requestParams = { ...state.requestParams, robotLogs: action.payload, isSyncLogs: false };

                return { ...state, UIState: { ...state.UIState, logsLoading: true }, requestParams };
            }
        }

        case actions.GET_ROBOT_LOGS_FAIL: {
            if (state.requestParams.isSyncLogs) {
                return { ...state, syncRobotLogsRes: action.payload };
            } else {
                return { ...state, UIState: { ...state.UIState, logsLoading: false }, robotLogsRes: action.payload };
            }
        }

        case actions.GET_ROBOT_LOGS_SUCCESS: {
            if (!state.requestParams.robotLogs) break; // 自动获取日志后，如果用户已经退出，停止操作。

            const result = pickUpLogs(action.payload.result.logs);

            action.payload.result = { ...action.payload.result, ...result };

            const { status, wd, node_id } = action.payload.result;

            const keyNames = ['status', 'wd', 'node_id'];

            const latestInfo: LatestRobotInfo = { flags: NaN, id: state.requestParams.robotLogs.robotId, status, wd, node_id };

            const robotDetailRes = updateRobotDetailRes(state.robotDetailRes, keyNames, latestInfo);

            const robotList = updateRobotListRes(state.robotList, keyNames, latestInfo);

            if (state.requestParams.isSyncLogs) {
                return { ...state, syncRobotLogsRes: action.payload, robotDetailRes, robotList };
            } else {
                return { ...state, UIState: { ...state.UIState, logsLoading: false }, robotLogsRes: action.payload, robotDetailRes, robotList };
            }
        }

        // restart robot
        case actions.RESTART_ROBOT:
            return { ...state, UIState: { ...state.UIState, restartRobotLoading: true }, requestParams: { ...state.requestParams, restartRobot: { ...action.payload } } };

        case actions.RESTART_ROBOT_FAIL:
            return { ...state, UIState: { ...state.UIState, restartRobotLoading: false }, restartRobotRes: action.payload };

        case actions.RESTART_ROBOT_SUCCESS: {
            const status = <number>action.payload.result;

            const latestInfo: LatestRobotInfo = { flags: NaN, id: state.requestParams.restartRobot.id, status };

            const keyNames = ['status'];

            const robotDetailRes = updateRobotDetailRes(state.robotDetailRes, keyNames, latestInfo);

            const robotList = updateRobotListRes(state.robotList, keyNames, latestInfo);

            return { ...state, UIState: { ...state.UIState, restartRobotLoading: false }, restartRobotRes: action.payload, robotDetailRes, robotList };
        }

        // stop robot
        case actions.STOP_ROBOT:
            return { ...state, UIState: { ...state.UIState, stopRobotLoading: true }, requestParams: { ...state.requestParams, stopRobot: { ...action.payload } } };

        case actions.STOP_ROBOT_FAIL:
            return { ...state, UIState: { ...state.UIState, stopRobotLoading: false }, stopRobotRes: action.payload };

        case actions.STOP_ROBOT_SUCCESS: {
            const status = <number>action.payload.result;

            const latestInfo: LatestRobotInfo = { flags: NaN, id: state.requestParams.stopRobot.id, wd: 0, status };

            const keyNames = ['status', 'wd'];

            const robotDetailRes = updateRobotDetailRes(state.robotDetailRes, keyNames, latestInfo);

            const robotList = updateRobotListRes(state.robotList, keyNames, latestInfo);

            return { ...state, UIState: { ...state.UIState, stopRobotLoading: false }, stopRobotRes: action.payload, robotDetailRes, robotList };
        }

        // modify robot config
        case actions.MODIFY_ROBOT:
            return { ...state, requestParams: { ...state.requestParams, modifyRobot: action.payload } };

        case actions.MODIFY_ROBOT_FAIL:
        case actions.MODIFY_ROBOT_SUCCESS:
            return { ...state, modifyRobotConfigRes: action.payload };

        // command robot config;
        case actions.COMMAND_ROBOT:
            return { ...state, requestParams: { ...state.requestParams, commandRobot: action.payload } };

        case actions.COMMAND_ROBOT_FAIL:
        case actions.COMMAND_ROBOT_SUCCESS:
            return { ...state, commandRobotRes: action.payload };

        // delete robot:
        case actions.DELETE_ROBOT:
            return { ...state, requestParams: { ...state.requestParams, deleteRobot: action.payload } };

        case actions.DELETE_ROBOT_FAIL:
            return { ...state, deleteRobotRes: action.payload };

        case actions.DELETE_ROBOT_SUCCESS: {
            const id = state.requestParams.deleteRobot.id;

            const robots = state.robotList.robots.filter(item => item.id !== id);

            return { ...state, robotList: { ...state.robotList, robots }, deleteRobotRes: action.payload };
        }

        // create robot
        case actions.SAVE_ROBOT:
            return { ...state, requestParams: { ...state.requestParams, saveRobot: action.payload } };

        case actions.SAVE_ROBOT_FAIL:
        case actions.SAVE_ROBOT_SUCCESS:
            return { ...state, saveRobotRes: action.payload };

        // run plugin
        case actions.RUN_PLUGIN:
            return { ...state, requestParams: { ...state.requestParams, pluginRun: action.payload }, UIState: { ...state.UIState, debugRobotLoading: true } };

        case actions.RUN_PLUGIN_FAIL:
        case actions.RUN_PLUGIN_SUCCESS:
            return { ...state, pluginRunRes: action.payload, UIState: { ...state.UIState, debugRobotLoading: false } };

        // ==============================================Local action=====================================================

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
        case actions.RESET_ROBOT_DETAIL: {
            const requestParams = {
                ...state.requestParams,
                robotLogs: null,
            };

            return { ...state, robotDetailRes: null, defaultParams: initialDefaultParams, syncRobotLogsRes: null, robotLogsRes: null, subscribeDetailRes: null, requestParams };
        }

        case actions.RESET_ROBOT_OPERATE: {
            return { ...state, restartRobotRes: null, stopRobotRes: null, deleteRobotRes: null };
        }

        // default params;
        case actions.MODIFY_DEFAULT_PARAMS:
            return { ...state, defaultParams: modifyDefaultParams(state.defaultParams, action.payload) };

        // monitoring message
        case actions.MONITOR_SOUND_TYPES:
            return { ...state, monitoringSound: { ...state.monitoringSound, logTypes: action.payload } };

        case actions.TOGGLE_MONITOR_SOUND:
            return { ...state, monitoringSound: { ...state.monitoringSound, isMonitorOpen: action.payload } };

        // ui state
        case actions.CHANGE_LOG_PAGE:
            return { ...state, UIState: { ...state.UIState, currentRunningLogPage: action.payload } };

        case actions.CHANGE_PROFIT_CHART_PAGE:
            return { ...state, UIState: { ...state.UIState, currentProfitChartPage: action.payload } };

        case actions.CHANGE_STRATEGY_CHART_PAGE:
            return { ...state, UIState: { ...state.UIState, currentStrategyChartPage: action.payload } };

        // update robot watch dog state
        case actions.UPDATE_ROBOT_WATCH_DOG_STATE: {
            const { id, watchDogStatus } = action.payload;

            const latestInfo: LatestRobotInfo = { flags: NaN, id, wd: watchDogStatus };

            const keys = ['wd'];

            return {
                ...state,
                robotList: updateRobotListRes(state.robotList, keys, latestInfo),
                robotDetailRes: updateRobotDetailRes(state.robotDetailRes, keys, latestInfo),
            };
        }

        // reset robot
        case actions.RESET_ROBOT_STATE:
            return {
                ...state,
                restartRobotRes: null,
            };

        // ==============================================Server send message=====================================================

        // server send message
        case actions.RECEIVE_SERVER_SEND_ROBOT_EVENT: {
            const keyNames = getKeyNameNeedUpdate(action.payload.flags);

            return {
                ...state,
                serverMessage: action.payload,
                robotDetailRes: updateRobotDetailRes(state.robotDetailRes, keyNames, action.payload),
                robotList: updateRobotListRes(state.robotList, keyNames, action.payload),
            };
        }

        default:
            return state;
    }
}

/**
 * Update robot arguments;
 */
function updateArg(args: VariableOverview[], target: VariableOverview | ImportedArg): VariableOverview[] {
    const index = args.findIndex(item => item.variableName === target.variableName);

    const { variableName, variableValue } = target;

    args[index] = { ...args[index], variableName, variableValue };

    return [...args];
}

/**
 * Update robot template arguments;
 */
function updateTemplateArg(args: TemplateVariableOverview[], data: VariableOverview | ImportedArg, templateFlag: string | number): TemplateVariableOverview[] {
    const target = args.find(item => item.name === templateFlag || item.id === templateFlag);

    target.variables = updateArg(target.variables, data);

    return [...args];
}

/**
 * This method used for translate the JSON type args to dictionary type, and finally flatten the two-dimensional array.
 * @param args Strategy args or template args;
 */
export function createScriptArgs(args: (string | number)[][]): VariableOverview[] {
    return args.map(ary => {
        const variable = completionParams(ary);

        const variableTypeId = getArgId(variable.variableValue);

        return { ...variable, variableTypeId };
    });
}

/**
 * Converting data structure from array to dictionary;
 */
export function completionParams(arg: (string | number)[]): VariableOverview {
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
    }
}

/**
 * Digitized parameter types;
 */
function getArgId(value: string | boolean | number): number {
    if (value === null) return 2;

    if (typeof value === 'number') {
        return 0;
    } else if (typeof value === 'boolean') {
        return 1;
    } else if (value.indexOf(LIST_PREFIX) === 0) {
        return 3;
    } else if (value.indexOf(ENCRYPT_PREFIX) === 0) {
        return 4;
    } else if (value === VALUE_OF_BUTTON_TYPE_ARG) {
        return 5;
    } else {
        return 2;
    }
}

// 搞不清这个函数里的条件对应的业务场景
// function isConditionCreateByRobotArgsAndTemplateIdCombination(arg: any[], comparisonName: string, templateId?: number): boolean {
//     return arg[0] === comparisonName && !templateId || arg.length === 2 && templateId == -1 || arg.length === 3 && arg[2] === templateId;
// }

/**
 * Delete characters that has a special meaning in the name of the variable name;
 * @deprecated
 * function updateVariableName(arg: VariableOverview): VariableOverview {
 *     let { variableName } = arg;
 *     if (variableName.indexOf(COMMAND_PREFIX) === 0) {
 *         variableName = variableName.split(COMMAND_PREFIX)[1];
 *     } else {
 *     }
 *     return { ...arg, variableName };
 * }
 */

/**
 * Extract log information from source data and store them in some custom field.
 */
function pickUpLogs(source: LogOverview[]): SemanticsLogsOverview {
    const [run, profit, strategy] = source;

    const runningLog: RunningLog[] = getRunningLogs(run.Arr);

    const profitLog: ProfitLog[] = profit.Arr.map(([id, pro, time]) => ({ id, profit: pro, time } as ProfitLog));

    const strategyLog: StrategyLog[] = strategy.Arr.map(([id, seriesIdx, data]) => ({ id, seriesIdx, data: JSON.parse(<string>data) } as StrategyLog));

    return {
        runningLog: { ...run, Arr: runningLog },
        profitLog: { ...profit, Arr: profitLog },
        strategyLog: { ...strategy, Arr: strategyLog },
    };
}

/**
 * Modify the default log parameters which used for send request to serve.
 */
function modifyDefaultParams(data: DefaultParams, payload: Map<string[], any>): DefaultParams {
    const result = cloneDeep(data);

    payload.forEach((value, keys) => {
        const last = keys.length - 1;

        keys.reduce((acc, cur, index) => {

            if (index === last) {
                acc[cur] = value;
            }
            return acc[cur];
        }, result);
    });

    return result;
}

/**
 * Extract field information that needs to be updated from the message sent by the server;
 */
function getKeyNameNeedUpdate(flag: number): string[] {
    const flagMap = [
        { value: ServerSendRobotEventType.UPDATE_STATUS, key: 'status' },
        { value: ServerSendRobotEventType.UPDATE_PROFIT, key: 'profit' },
        { value: ServerSendRobotEventType.UPDATE_SUMMARY, key: 'summary' },
        // { value: ServerSendRobotEventType.UPDATE_PUSH, key: '' }, // !FIXME: push的事件没有对应的字段
        { value: ServerSendRobotEventType.UPDATE_REFRESH, key: 'refresh' },
        { value: ServerSendRobotEventType.UPDATE_DEBUG, key: 'debug' },
    ];

    return flagMap.filter(item => item.value & flag).map(item => item.key);
}

/**
 * Update robot detail field when serve send message arrived.
 */
function updateRobotDetailRes(data: GetRobotDetailResponse, keys: string[], source: LatestRobotInfo): GetRobotDetailResponse {
    if (data === null) return null;

    const { error, action, result } = data;

    const { robot } = result;

    if (robot.id !== source.id) return data;

    const updatedRobot = keys.reduce((acc, key) => source[key] == null ? acc : { ...acc, [key]: source[key] }, robot);

    return { error, action, result: { robot: updatedRobot } };
}

/**
 * Update robot field that in robot list when serve send message arrived.
 */
function updateRobotListRes(data: RobotListResponse, keys: string[], source: LatestRobotInfo): RobotListResponse {
    if (!data) return data; // 避免直接从URL上访问机器人页面时，会报 can't read property 'all' of null 错误。

    const { all, concurrent, robots } = data;

    const index = robots.findIndex(robot => robot.id === source.id);

    if (index < 0) return data;

    const updatedRobot = keys.reduce((acc, key) => source[key] == null ? acc : { ...acc, [key]: source[key] }, robots[index]);

    robots[index] = updatedRobot;

    return { all, concurrent, robots: cloneDeep(robots) };
}

export const getRobotListResState = (state: State) => state.robotListResState;

export const getRobotData = (state: State) => state.robotList;

export const getPublicRobotRes = (state: State) => state.publicRobotRes;

export const getRobotDetailRes = (state: State) => state.robotDetailRes;

export const getSubscribeRobotRes = (state: State) => state.subscribeDetailRes;

export const getRobotLogsRes = (state: State) => state.robotLogsRes;

export const getRestartRobotRes = (state: State) => state.restartRobotRes;

export const getStopRobotRes = (state: State) => state.stopRobotRes;

export const getRobotArgs = (state: State) => state.robotArgs;

export const getModifyRobotRes = (state: State) => state.modifyRobotConfigRes;

export const getCommandRobotRes = (state: State) => state.commandRobotRes;

export const getDefaultParams = (state: State) => state.defaultParams;

export const getMonitoringSound = (state: State) => state.monitoringSound;

export const getUIState = (state: State) => state.UIState;

export const getServerSendMessage = (state: State) => state.serverMessage;

export const getSyncLogsResponse = (state: State) => state.syncRobotLogsRes;

export const getRequestParameter = (state: State) => state.requestParams;

export const getDeleteRobotRes = (state: State) => state.deleteRobotRes;

export const getSaveRobotRes = (state: State) => state.saveRobotRes;

export const getPluginRunRes = (state: State) => state.pluginRunRes;

export const getPublicRobotListRes = (state: State) => state.publicRobotListRes;
