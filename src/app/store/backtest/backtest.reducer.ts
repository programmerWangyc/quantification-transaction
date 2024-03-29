import { flatten, isNumber } from 'lodash';
import { from } from 'rxjs';
import { concatMap, filter, map, reduce } from 'rxjs/operators';

import { LocalStorageKey } from '../../app.config';
import { Filter } from '../../backtest/arg-optimizer/arg-optimizer.component';
import { BacktestMilestone } from '../../backtest/backtest.config';
import {
    ArgOptimizeSetting, BacktestCode, BacktestSelectedPair, BacktestTaskDescription, BacktestTimeConfig,
    OptimizedVariableOverview
} from '../../backtest/backtest.interface';
import { CompareLogic, MAIN_CODE_FLAG } from '../../backtest/providers/backtest.constant.service';
import { BacktestIORequest, BacktestIOType, GetTemplatesRequest } from '../../interfaces/request.interface';
import {
    BacktestIOResponse, BacktestResult, GetTemplatesResponse, ServerBacktestResult, ServerSendBacktestMessage,
    TemplatesResponse
} from '../../interfaces/response.interface';
import { K_LINE_PERIOD } from '../../providers/constant.service';
import * as actions from './backtest.action';

export interface AdvancedOption {
    barLen: number;
    chart: number;
    delay: number;
    faultTolerant: number;
    log: number;
    profit: number;
    slipPoint: number;
}

const storedAdvancedOptions = JSON.parse(localStorage.getItem(LocalStorageKey.backtestAdvancedOptions));

export interface UIState {
    advancedOptions: AdvancedOption;
    backtestCode: BacktestCode[];
    backtestLevel: number;
    backtestMilestone: number;
    backtestTaskFiler: Filter[];
    backtestTasks: BacktestTaskDescription[][];
    floorKlinePeriod: number;
    isBacktesting: boolean;
    isFaultTolerantMode: boolean;
    isForbiddenBacktest: boolean;
    platformOptions: BacktestSelectedPair[];
    runningNode: number;
    timeOptions: BacktestTimeConfig;
    backtestingTaskIndex: number;
    isOptimizedBacktest: boolean;
}

export const defaultAdvancedOptions: AdvancedOption = { log: 8000, profit: 8000, chart: 3000, slipPoint: 0, delay: 200, faultTolerant: 0.5, barLen: 300 };

export const initialUIState: UIState = {
    advancedOptions: storedAdvancedOptions || defaultAdvancedOptions,
    backtestCode: [],
    backtestLevel: 0,
    backtestMilestone: null,
    backtestTaskFiler: [],
    backtestTasks: null,
    floorKlinePeriod: K_LINE_PERIOD.find(item => item.minutes === 5).id,
    isBacktesting: false,
    isFaultTolerantMode: false,
    isForbiddenBacktest: true,
    platformOptions: null,
    runningNode: 0,
    timeOptions: {
        start: null,
        end: null,
        klinePeriodId: K_LINE_PERIOD.find(item => item.minutes === 15).id,
    },
    backtestingTaskIndex: 0,
    isOptimizedBacktest: false,
};

export interface RequestParams {
    backtestReq: BacktestIORequest;
    templateReq: GetTemplatesRequest;
}

/**
 * 文档工具不支持这种写法，要注意这个接口的字段应该和BacktestIOType的字段保持一致。
 * export interface BacktestStateMemory<T> {
 *     [BacktestIOType.deleteTask]: T;
 *     [BacktestIOType.getTaskResult]: T;
 *     [BacktestIOType.getTaskStatus]: T;
 *     [BacktestIOType.putTask]: T;
 *     [BacktestIOType.stopTask]: T;
 * }
 */

export interface BacktestStateMemory<T> {
    DelTask: T;
    GetTaskStatus: T;
    GetTaskResult: T;
    PutTask: T; // [node , python|python2.7|python3|py, g++]  script
    StopTask: T;
}

export interface State {
    UIState: UIState;
    backtestRes: BacktestIOResponse;
    backtestResults: BacktestIOResponse[];
    backtestState: BacktestStateMemory<number | ServerBacktestResult<BacktestResult | string>>;
    requestParams: RequestParams;
    serverMessage: ServerSendBacktestMessage<BacktestResult>;
    serverMessages: ServerSendBacktestMessage<BacktestResult>[];
    templates: TemplatesResponse[];
    templatesRes: GetTemplatesResponse;
    isAllTasksCompleted: boolean; // null: 未触发回测任务；true：all complete; false: unfinished;
}

const initialRequestParams = {
    backtestReq: null,
    templateReq: null,
};

const initialBacktestState = {
    [BacktestIOType.deleteTask]: null,
    [BacktestIOType.getTaskResult]: null,
    [BacktestIOType.getTaskStatus]: null,
    [BacktestIOType.putTask]: null,
    [BacktestIOType.stopTask]: null,
};

const initialState: State = {
    UIState: initialUIState,
    backtestRes: null,
    backtestResults: null,
    backtestState: initialBacktestState,
    requestParams: initialRequestParams,
    serverMessage: null,
    serverMessages: null,
    templates: [],
    templatesRes: null,
    isAllTasksCompleted: null,
};

/**
 * @ignore
 */
export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        // ==============================================Api action=====================================================

        // get templates
        case actions.GET_TEMPLATES:
            return { ...state, requestParams: { ...state.requestParams, templateReq: action.payload } };

        case actions.GET_TEMPLATES_FAIL:
            return { ...state, templatesRes: action.payload };

        case actions.GET_TEMPLATES_SUCCESS:
            return { ...state, templatesRes: action.payload, templates: [...state.templates, ...action.payload.result] };

        // backtest io
        case actions.EXECUTE_BACKTEST:
            return {
                ...state,
                backtestState: { GetTaskResult: null, PutTask: null, GetTaskStatus: null, DelTask: null, StopTask: null },
                serverMessage: null,
                requestParams: { ...state.requestParams, backtestReq: action.payload },
                UIState: { ...state.UIState, backtestingTaskIndex: state.UIState.backtestingTaskIndex + 1 },
            };

        case actions.GET_BACKTEST_RESULT:
        case actions.GET_BACKTEST_STATUS:
        case actions.DELETE_BACKTEST_TASK:
        case actions.STOP_BACKTEST_TASK:
            return {
                ...state,
                requestParams: { ...state.requestParams, backtestReq: action.payload },
            };

        case actions.EXECUTE_BACKTEST_FAIL:
        case actions.GET_BACKTEST_STATUS_FAIL:
        case actions.DELETE_BACKTEST_TASK_FAIL:
        case actions.STOP_BACKTEST_TASK_FAIL:
            return { ...state, backtestRes: { ...action.payload, result: getBacktestResult(action.payload) } };

        case actions.EXECUTE_BACKTEST_SUCCESS: {
            const result = getBacktestResult(action.payload);

            return {
                ...state,
                backtestRes: { ...action.payload, result },
                backtestState: { ...state.backtestState, [actions.backtestCallbackIdMapType.get(action.payload.action)]: result },
                UIState: { ...state.UIState, backtestMilestone: BacktestMilestone.BACKTESTING },
            };
        }

        case actions.GET_BACKTEST_STATUS_SUCCESS:
        case actions.DELETE_BACKTEST_TASK_SUCCESS: {
            const result = getBacktestResult(action.payload);

            const isComplete = state.UIState.backtestTasks.length === 0 ? true : state.backtestResults.length === state.UIState.backtestTasks.length;

            return {
                ...state,
                backtestRes: { ...action.payload, result },
                backtestState: isComplete ? initialBacktestState : { ...state.backtestState, [actions.backtestCallbackIdMapType.get(action.payload.action)]: result },
            };
        }

        case actions.STOP_BACKTEST_TASK_SUCCESS: {
            const result = getBacktestResult(action.payload);

            return {
                ...state,
                backtestRes: { ...action.payload, result },
                backtestState: { ...state.backtestState, [actions.backtestCallbackIdMapType.get(action.payload.action)]: result },
                UIState: { ...state.UIState, isBacktesting: false, backtestMilestone: null, isForbiddenBacktest: false },
            };
        }

        // backtest result
        case actions.GET_BACKTEST_RESULT_FAIL:
        case actions.GET_BACKTEST_RESULT_SUCCESS: {
            const result = getBacktestResult(action.payload);

            const backtestResults = state.backtestResults ? [...state.backtestResults, { ...action.payload, result }] : [{ ...action.payload, result }];

            const isResultsAllReceived = state.UIState.backtestTasks.length === 0 ? true : backtestResults.length === state.UIState.backtestTasks.length;

            return {
                ...state,
                backtestResults,
                backtestRes: { ...action.payload, result },
                backtestState: { ...state.backtestState, [actions.backtestCallbackIdMapType.get(action.payload.action)]: result },
                UIState: {
                    ...state.UIState,
                    backtestMilestone: isResultsAllReceived ? null : state.UIState.backtestMilestone,
                    isBacktesting: !isResultsAllReceived,
                    isForbiddenBacktest: !isResultsAllReceived,
                    backtestingTaskIndex: isResultsAllReceived ? 0 : state.UIState.backtestingTaskIndex,
                },
            };
        }


        // ==============================================Server send message=====================================================

        // server send message
        case actions.RECEIVE_SERVER_SEND_BACKTEST_EVENT: {
            const { output, status, uuid } = action.payload;

            const serverMessage = { output, uuid, status: <BacktestResult>JSON.parse(status) };

            const serverMessages = state.serverMessages ? [...state.serverMessages, serverMessage] : [serverMessage];

            return {
                ...state,
                serverMessage,
                serverMessages,
                /**
                 * 接收到服务器的消息时证明此回测已完成，但此时还未去获取回测结果，所以需要加1;
                 * 回测任务的长度为0时是未调优回测；调优回测任务长度为0时无法发起任务。
                 */
                isAllTasksCompleted: isAllTasksCompleted(state.UIState.backtestTasks, state.backtestResults),
                UIState: { ...state.UIState, backtestMilestone: BacktestMilestone.START_RECEIVE_LOG_AFTER_BACKTEST_COMPLETE },
            };
        }

        // ==============================================Local action=====================================================

        // time range
        case actions.UPDATE_SELECTED_TIME_RANGE:
            return { ...state, UIState: { ...state.UIState, timeOptions: { ...state.UIState.timeOptions, ...action.payload } } };

        // kline period
        case actions.UPDATE_SELECTED_KLINE_PERIOD:
            return { ...state, UIState: { ...state.UIState, timeOptions: { ...state.UIState.timeOptions, klinePeriodId: action.payload } } };

        // floor kline period
        case actions.UPDATE_FLOOR_KLINE_PERIOD:
            return { ...state, UIState: { ...state.UIState, floorKlinePeriod: action.payload } };

        // advanced options
        case actions.UPDATE_BACKTEST_ADVANCED_OPTION: {
            const advancedOptions = { ...state.UIState.advancedOptions, ...action.payload };

            localStorage.setItem(LocalStorageKey.backtestAdvancedOptions, JSON.stringify(advancedOptions));

            return { ...state, UIState: { ...state.UIState, advancedOptions } };
        }

        // platform options
        case actions.UPDATE_BACKTEST_PLATFORM_OPTION:
            return { ...state, UIState: { ...state.UIState, platformOptions: action.payload, isForbiddenBacktest: !action.payload.length } };

        // running node
        case actions.UPDATE_RUNNING_NODE:
            return { ...state, UIState: { ...state.UIState, runningNode: action.payload } };

        // backtest mode
        case actions.TOGGLE_BACKTEST_MODE:
            return { ...state, UIState: { ...state.UIState, isFaultTolerantMode: !state.UIState.isFaultTolerantMode } };

        // backtest code
        case actions.UPDATE_BACKTEST_CODE:
            return { ...state, UIState: { ...state.UIState, backtestCode: updateCode(action.payload, state.UIState.backtestCode) } };

        // check backtest template code
        case actions.CHECK_BACKTEST_TEMPLATE_CODE:
            return { ...state, UIState: { ...state.UIState, backtestCode: state.UIState.backtestCode.filter(item => isMineCode(item) || action.payload.includes(item.id)) } };

        // backtest arg filter
        case actions.UPDATE_BACKTEST_ARG_FILTER:
            return { ...state, UIState: { ...state.UIState, backtestTaskFiler: action.payload } };

        // generate to be tested values for every optimizing args
        case actions.GENERATE_TO_BE_TESTED_VALUES: {
            const backtestCode = generateToBeTestedValues(state.UIState.backtestCode);

            // 清空回测结果，服务端推送的消息，backtestIO的响应以及回测的状态。
            return {
                ...state,
                UIState: {
                    ...state.UIState,
                    backtestCode,
                    backtestTasks: filterBacktestTasks(generateBacktestTasks(backtestCode), state.UIState.backtestTaskFiler),
                    isOptimizedBacktest: state.UIState.backtestCode.some(code => code.args.some(arg => arg.isOptimizing)),
                },
                ...resetState(),
            };
        }

        // backtest level
        case actions.UPDATE_BACKTEST_LEVEL:
            return { ...state, UIState: { ...state.UIState, backtestLevel: action.payload } };

        // loading
        case actions.OPEN_BACKTEST_LOADING_STATE:
            return {
                ...state,
                backtestResults: [],
                backtestState: initialBacktestState,
                backtestRes: null,
                UIState: {
                    ...state.UIState,
                    isBacktesting: true,
                    isForbiddenBacktest: true,
                    backtestMilestone: BacktestMilestone.BACKTEST_SYSTEM_LOADING,
                },
            };

        // reset backtest related state
        case actions.RESET_BACKTEST_RELATED_STATE:
            return initialState;

        // webworker success
        case actions.WORKER_BACKTEST_SUCCESS: {
            const result = action.payload;

            const forgeResponse = { error: null, result: { Code: 0, Result: JSON.stringify(result) }, action: actions.BacktestOperateCallbackId.result };

            const backtestResults = state.backtestResults ? [...state.backtestResults, forgeResponse] : [forgeResponse];

            const isResultsAllReceived = isAllTasksCompleted(state.UIState.backtestTasks, backtestResults, true);

            return {
                ...state,
                backtestResults,
                backtestRes: forgeResponse,
                UIState: {
                    ...state.UIState,
                    isBacktesting: !isResultsAllReceived,
                    isForbiddenBacktest: !isResultsAllReceived,
                    backtestMilestone: isResultsAllReceived ? null : state.UIState.backtestMilestone,
                    backtestingTaskIndex: isResultsAllReceived ? 0 : state.UIState.backtestingTaskIndex,
                },
                isAllTasksCompleted: isResultsAllReceived,
            };
        }

        // webworker status updated
        case actions.WORKER_BACKTEST_STATUS_UPDATED:
            return {
                ...state,
                backtestState: { ...state.backtestState, GetTaskStatus: { Code: 0, Result: JSON.stringify(action.payload) } },
            };

        // backtesting index;
        case actions.INCREASE_BACKTESTING_TASK_INDEX: {
            return { ...state, UIState: { ...state.UIState, backtestingTaskIndex: state.UIState.backtestingTaskIndex + 1 } };
        }

        // webworker backtest terminate
        case actions.TERMINATE_WORKER_BACKTEST:
            return { ...state, UIState: { ...state.UIState, isBacktesting: false, isForbiddenBacktest: false, backtestMilestone: null, backtestingTaskIndex: 0 } };

        default:
            return state;
    }
}

/**
 * 是否回测的主代码，也就是策略代码或模板代码。
 * @param data 回测代码
 */
function isMineCode(data: BacktestCode): boolean {
    return data.name === MAIN_CODE_FLAG;
}

/**
 * 更新store中存储的需要参与回测的代码，包括策略代码和它依赖的模板。
 * @param fresh 新代码，大部分情况下应该是策略依赖的模板代码，只有首次进来的时候才是策略的代码。
 * @param list 回测的代码集合，store中存储的值。
 */
function updateCode(fresh: BacktestCode, list: BacktestCode[]): BacktestCode[] {
    const index = list.findIndex(item => item.name === fresh.name);

    const mainCode = list.find(isMineCode);

    if (isMineCode(fresh) && mainCode && fresh.id !== mainCode.id) { // 更新的是策略代码并且策略的ID改变，清空模板依赖。
        return [fresh];
    }

    if (index < 0) {
        return [fresh, ...list]; // 顺序不能变，策略代码必须放在最后；
    } else {
        list[index] = fresh;

        return [...list];
    }
}

function generateToBeTestedValues(data: BacktestCode[]): BacktestCode[] {
    return data.map(code => {
        const { name, id } = code;

        let { args } = code;

        args = args.map(arg => arg.isOptimizing ? { ...arg, toBeTestedValues: getToBeTestedValues(arg.optimize) } : arg);

        return { name, id, args };
    });
}

function getToBeTestedValues(data: ArgOptimizeSetting): number[] {

    const { step, end } = data;

    const testedValues = [];

    const multiple = 10 ** 6;

    let { begin } = data;

    while (true) {
        testedValues.push(begin);

        const next = Math.round((begin + step) * multiple) / multiple;

        if (next <= end) {
            begin = next;
        } else if (next > end && begin < end) {
            begin = end;
        } else {
            break;
        }
    }

    return testedValues;
}

function generateBacktestTasks(source: BacktestCode[]): BacktestTaskDescription[][] {
    let tasks: BacktestTaskDescription[][] = null;

    from(source).pipe(
        map(({ id, name, args }) => ({ id, name, args: <OptimizedVariableOverview[]>args.filter(arg => arg.toBeTestedValues) })),
        filter(data => !!data.args.length),
        concatMap(({ args, name }) => from(args).pipe(
            map(arg => arg.toBeTestedValues.map(value => ({
                file: name,
                variableName: arg.variableName,
                variableDes: arg.variableDes,
                variableValue: value,
            })))
        )),
        reduce((acc: BacktestTaskDescription[][], cur: BacktestTaskDescription[]) => acc.length === 0 ?
            cur.map(item => [item]) : flatten(acc.map(group => cur.map(item => [...group, item]))),
            []
        ),
    ).subscribe(result => tasks = result);

    return tasks;
}

type FilterPredicateFun = (data: BacktestTaskDescription[]) => boolean;

function filterBacktestTasks(data: BacktestTaskDescription[][], filters: Filter[]): BacktestTaskDescription[][] {
    if (!filters || !filters.length) return data;

    const predicateFns: FilterPredicateFun[] = filters.map(filterer => filterPredicateFunFactory(filterer));

    return data.filter(task => predicateFns.every(fn => fn(task)));
}

function filterPredicateFunFactory(filterer: Filter): FilterPredicateFun {
    return (data: BacktestTaskDescription[]): boolean => {
        const { comparedVariable, compareVariable, logic, baseValue } = filterer;

        const findValue = (variable: OptimizedVariableOverview) => data.find(item => item.file === MAIN_CODE_FLAG && item.variableDes === variable.variableDes && item.variableName === variable.variableName);

        const left = findValue(compareVariable);

        const right = findValue(comparedVariable);

        const operator = logic.operator;

        const result = left.variableValue - right.variableValue;

        if (logic.id === CompareLogic.MORE_THAN) {
            // tslint:disable-next-line:no-eval
            return result > 0 && eval(result + operator + baseValue);
        } else if (logic.id === CompareLogic.LESS_THAN) {
            // tslint:disable-next-line:no-eval
            return result < 0 && !eval(Math.abs(result) + operator + baseValue);
        } else if (logic.id === CompareLogic.EQUAL) {
            return result === 0;
        } else {
            throw Error('Compare logic error: supported operators: "more than: >=", "less than: <=" and "equal: ===".');
        }
    };
}

function getBacktestResult(payload: BacktestIOResponse): string | number | ServerBacktestResult<string | BacktestResult> {
    const { result } = payload;

    return isNumber(result) ? result : <ServerBacktestResult<string>>JSON.parse(<string>result);
}

function resetState(): any {
    return {
        backtestRes: null,
        serverMessage: null,
        serverMessages: null,
        backtestResults: null,
        backtestState: initialBacktestState,
        isAllTasksCompleted: null,
    };
}

function isAllTasksCompleted(tasks: BacktestTaskDescription[][], results: BacktestIOResponse[], alreadyReceivedResult = false): boolean {
    const taskAmount = tasks.length;

    let resultCount = results ? results.length : 0;

    resultCount = alreadyReceivedResult ? resultCount : resultCount + 1;

    return taskAmount ? taskAmount === resultCount : true;
}

export const getUIState = (state: State) => state.UIState;

export const getTemplatesRes = (state: State) => state.templatesRes;

export const getTemplates = (state: State) => state.templates;

export const getBacktestReqParams = (state: State) => state.requestParams;

export const getBacktestRes = (state: State) => state.backtestRes;

export const getBacktestState = (state: State) => state.backtestState;

export const getServerSendMessage = (state: State) => state.serverMessage;

export const getBacktestServerMessages = (state: State) => state.serverMessages;

export const getBacktestResults = (state: State) => state.backtestResults;

export const isTasksAllCompleted = (state: State) => state.isAllTasksCompleted;
