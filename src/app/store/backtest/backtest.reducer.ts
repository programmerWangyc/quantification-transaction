import { flatten, isNumber } from 'lodash';
import { from } from 'rxjs';
import { concatMap, filter, map, reduce } from 'rxjs/operators';

import { LocalStorageKey } from '../../app.config';
import { Filter } from '../../backtest/arg-optimizer/arg-optimizer.component';
import {
    ArgOptimizeSetting,
    BacktestCode,
    BacktestSelectedPair,
    BacktestTaskDescription,
    BacktestTimeConfig,
    OptimizedVariableOverview,
} from '../../backtest/backtest.interface';
import { CompareLogic, MAIN_CODE_FLAG } from '../../backtest/providers/backtest.constant.service';
import { BacktestIORequest, BacktestIOType, GetTemplatesRequest } from '../../interfaces/request.interface';
import {
    BacktestIOResponse,
    BacktestTaskResult,
    GetTemplatesResponse,
    ServerBacktestResult,
    ServerSendBacktestMessage,
    TemplatesResponse,
} from '../../interfaces/response.interface';
import { K_LINE_PERIOD } from '../../providers/constant.service';
import * as actions from './backtest.action';
import { BacktestMilestone } from '../../backtest/backtest.config';

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
    platformOptions: BacktestSelectedPair[];
    runningNode: number;
    timeOptions: BacktestTimeConfig;
}

export const defaultAdvancedOptions: AdvancedOption = { log: 8000, profit: 8000, chart: 3000, slipPoint: 0, delay: 200, faultTolerant: 0.5, barLen: 300 };

export const initialStateUIState: UIState = {
    advancedOptions: storedAdvancedOptions || defaultAdvancedOptions,
    backtestCode: [],
    backtestLevel: 0,
    backtestMilestone: NaN,
    backtestTaskFiler: [],
    backtestTasks: null,
    floorKlinePeriod: K_LINE_PERIOD.find(item => item.minutes === 5).id,
    isBacktesting: false,
    isFaultTolerantMode: false,
    platformOptions: null,
    runningNode: 0,
    timeOptions: {
        start: null,
        end: null,
        klinePeriodId: K_LINE_PERIOD.find(item => item.minutes === 15).id,
    },
}

export interface RequestParams {
    backtestReq: BacktestIORequest;
    backtestReqType: string;
    templateReq: GetTemplatesRequest;
}

export interface BacktestStateMemory<T> {
    [BacktestIOType.deleteTask]: T;
    [BacktestIOType.getTaskResult]: T;
    [BacktestIOType.getTaskStatus]: T;
    [BacktestIOType.putTask]: T;
    [BacktestIOType.stopTask]: T;
}

export interface State {
    UIState: UIState;
    backtestRes: BacktestIOResponse;
    backtestResults: BacktestIOResponse[];
    backtestState: BacktestStateMemory<number | ServerBacktestResult<BacktestTaskResult | string>>;
    requestParams: RequestParams;
    serverMessage: ServerSendBacktestMessage<BacktestTaskResult>;
    serverMessages: ServerSendBacktestMessage<BacktestTaskResult>[];
    templates: TemplatesResponse[];
    templatesRes: GetTemplatesResponse;
}

const initialRequestParams = {
    backtestReq: null,
    backtestReqType: null,
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
    UIState: initialStateUIState,
    backtestRes: null,
    backtestResults: null,
    backtestState: initialBacktestState,
    requestParams: initialRequestParams,
    serverMessage: null,
    serverMessages: null,
    templates: [],
    templatesRes: null,
}

export function reducer(state = initialState, action: actions.Actions): State {
    switch (action.type) {

        /** ==============================================Api action===================================================== **/

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
                requestParams: { ...state.requestParams, backtestReq: action.payload, backtestReqType: JSON.parse(action.payload.io)[0] },
            };

        case actions.GET_BACKTEST_RESULT:
        case actions.GET_BACKTEST_STATUS:
        case actions.DELETE_BACKTEST_TASK:
        case actions.STOP_BACKTEST_TASK:
            return {
                ...state,
                requestParams: { ...state.requestParams, backtestReq: action.payload, backtestReqType: JSON.parse(action.payload.io)[0] },
            };

        case actions.EXECUTE_BACKTEST_FAIL:
        case actions.GET_BACKTEST_RESULT_FAIL:
        case actions.GET_BACKTEST_STATUS_FAIL:
        case actions.DELETE_BACKTEST_TASK_FAIL:
        case actions.STOP_BACKTEST_TASK_FAIL:
            return { ...state, backtestRes: action.payload };

        case actions.EXECUTE_BACKTEST_SUCCESS: {
            const result = getBacktestResult(action.payload);

            return {
                ...state,
                backtestRes: { ...action.payload, result },
                backtestState: { ...state.backtestState, [state.requestParams.backtestReqType]: result },
                UIState: { ...state.UIState, backtestMilestone: BacktestMilestone.BACKTESTING },
            };
        }

        case actions.GET_BACKTEST_STATUS_SUCCESS:
        case actions.DELETE_BACKTEST_TASK_SUCCESS:
        case actions.STOP_BACKTEST_TASK_SUCCESS: {
            const result = getBacktestResult(action.payload);

            return {
                ...state,
                backtestRes: { ...action.payload, result },
                backtestState: { ...state.backtestState, [state.requestParams.backtestReqType]: result },
            };
        }

        case actions.GET_BACKTEST_RESULT_SUCCESS: {
            const result = getBacktestResult(action.payload);

            const backtestResults = state.backtestResults ? [...state.backtestResults, { ...action.payload }] : [{ ...action.payload }];

            const isResultsAllReceived = backtestResults.length === 0 ? true:  backtestResults.length === state.UIState.backtestTasks.length;

            return {
                ...state,
                backtestResults,
                backtestRes: { ...action.payload, result },
                backtestState: { ...state.backtestState, [state.requestParams.backtestReqType]: result },
                UIState: { ...state.UIState, backtestMilestone: isResultsAllReceived ? NaN : state.UIState.backtestMilestone, isBacktesting: !isResultsAllReceived }
            };
        }


        /** ==============================================Server send message===================================================== **/

        // server send message
        case actions.RECEIVE_SERVER_SEND_BACKTEST_EVENT: {
            const { output, status, uuid } = action.payload;

            const serverMessage = { output, uuid, status: <BacktestTaskResult>JSON.parse(status) };

            const serverMessages = state.serverMessages ? [...state.serverMessages, serverMessage] : [serverMessage];

            return { ...state, serverMessage, serverMessages, UIState: { ...state.UIState, backtestMilestone: BacktestMilestone.START_RECEIVE_LOG_AFTER_BACKTEST_COMPLETE } };
        }

        /** ==============================================Local action===================================================== **/

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
            return { ...state, UIState: { ...state.UIState, platformOptions: action.payload } };

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

            // TODO: 在 service 中需要处理 backtest的空值，给用户提示。此时回测任务不应该被发出去
            // 清空回测结果，服务端推送的消息，backtestIO的响应以及回测的状态。
            return {
                ...state,
                UIState: { ...state.UIState, backtestCode, backtestMilestone: BacktestMilestone.BACKTEST_SYSTEM_LOADING, backtestTasks: filterBacktestTasks(generateBacktestTasks(backtestCode), state.UIState.backtestTaskFiler) },
                backtestRes: null,
                serverMessage: null,
                serverMessages: null,
                backtestState: initialBacktestState,
            };
        }

        // backtest level
        case actions.UPDATE_BACKTEST_LEVEL:
            return { ...state, UIState: { ...state.UIState, backtestLevel: action.payload } };

        // loading
        case actions.TOGGLE_BACKTEST_LOADING_STATE:
            return { ...state, UIState: { ...state.UIState, isBacktesting: action.payload } };

        // reset backtest related state
        case actions.RESET_BACKTEST_RELATED_STATE:
            return { ...state, backtestRes: null, serverMessage: null, serverMessages: null, backtestState: initialBacktestState };

        default:
            return state;
    }
}

function isMineCode(data: BacktestCode): boolean {
    return data.name === MAIN_CODE_FLAG;
}

/**
 *
 * @param fresh 新代码，大部分情况下应该是策略依赖的模板代码，只有每次进来的时候才是策略的代码。
 * @param list 回测的代码集合，store中存储的值。
 * @description 更新store中存储的需要参与回测的代码，包括策略代码和它依赖的模板。
 */
function updateCode(fresh: BacktestCode, list: BacktestCode[]): BacktestCode[] {
    const index = list.findIndex(item => item.name === fresh.name);

    const mainCode = list.find(isMineCode);

    if (isMineCode(fresh) && mainCode && fresh.id !== mainCode.id) { // 更新的是策略代码并且策略的ID改变，清空模板依赖。
        return [fresh];
    }

    if (index < 0) {
        return [...list, fresh];
    } else {
        list[index] = fresh;

        return [...list];
    }
}

/**
 * @function generateToBeTestedValues
 * @description 如果代码中的参数设置了调优，根据调优设置成新的字段存储被测试的参数值，同时生成回测任务，
 */
function generateToBeTestedValues(data: BacktestCode[]): BacktestCode[] {
    return data.map(code => {
        let { name, id, args } = code;

        args = args.map(arg => arg.isOptimizing ? { ...arg, toBeTestedValues: getToBeTestedValues(arg.optimize) } : arg);

        return { name, id, args };
    })
}

/**
 * @function getToBeTestedValues
 * @description 根据参数的调优设置生成需要测试的值。
 */
function getToBeTestedValues(data: ArgOptimizeSetting): number[] {
    let { step, begin, end } = data;

    const testedValues = [];

    const multiple = 10 ** 6;

    while (true) {
        testedValues.push(begin);

        const next = Math.round((begin + step) * multiple) / multiple;

        if (next <= end) {
            begin = next;
        } else if (next > end && begin < end) {
            begin = end;
        } else {
            break
        }
    }

    return testedValues;
}

/**
 * @function generateBacktestTasks
 * @description 根据参数的调优设置生成测试任务，生成的数组中的每一项用来描述该测试任务所对应的各个参数。
 */
function generateBacktestTasks(data: BacktestCode[]): BacktestTaskDescription[][] {
    let tasks: BacktestTaskDescription[][] = null;

    from(data)
        .pipe(
            map(({ id, name, args }) => ({ id, name, args: <OptimizedVariableOverview[]>args.filter(arg => arg.toBeTestedValues) })),
            filter(data => !!data.args.length),
            concatMap(({ args, name }) => from(args)
                .pipe(map(arg => arg.toBeTestedValues.map(value => ({
                    file: name,
                    variableName: arg.variableName,
                    variableDes: arg.variableDes,
                    variableValue: value
                }))))
            ),
            reduce((acc: BacktestTaskDescription[][], cur: BacktestTaskDescription[]) => acc.length === 0 ?
                cur.map(item => [item]) :
                flatten(acc.map(group => cur.map(item => [...group, item]))),
                []),
    ).subscribe(result => tasks = result);

    return tasks;
}

interface FilterPredicateFun {
    (data: BacktestTaskDescription[]): boolean;
}

/**
 * @function filterBacktestTasks
 * @description 过滤出符合过滤器规定的条件的任务, 只对策略参数有效， 因为只有策略参数才可以设置参数过滤器。
 */
function filterBacktestTasks(data: BacktestTaskDescription[][], filters: Filter[]): BacktestTaskDescription[][] {
    if (!filters || !filters.length) return data;

    const predicateFns: FilterPredicateFun[] = filters.map(filter => filterPredicateFunFactory(filter));

    return data.filter(task => predicateFns.every(fn => fn(task)));
}

/**
 * @function filterPredicateFunFactory
 * @param filter - 参数过滤器
 * @description 生成过滤器判定函数的工厂函数。
 * @returns 返回的函数用来判定回测任务的参数设置是否符合过滤器的描述。当参数设置符合过滤器的描述时，判定函数返回true，反之返回false。
 */
function filterPredicateFunFactory(filter: Filter): FilterPredicateFun {
    return (data: BacktestTaskDescription[]): boolean => {
        const { comparedVariable, compareVariable, logic, baseValue } = filter;

        const findValue = (variable: OptimizedVariableOverview) => data.find(item => item.file === MAIN_CODE_FLAG && item.variableDes === variable.variableDes && item.variableName === variable.variableName);

        // 只要加了优化过滤器，必然可以在主代码中找到两个比较的值，所以findValue的结果一定是存在的。
        const left = findValue(compareVariable);

        const right = findValue(comparedVariable);

        const operator = logic.operator;

        const result = left.variableValue - right.variableValue;

        if (logic.id === CompareLogic.MORE_THAN) {
            return result > 0 && eval(result + operator + baseValue);
        } else if (logic.id === CompareLogic.LESS_THAN) {
            return result < 0 && !eval(Math.abs(result) + operator + baseValue);
        } else if (logic.id === CompareLogic.EQUAL) {
            return result === 0;
        } else {
            // 但愿永远不要进来
            throw Error('Compare logic error: supported operators: "more than: >=", "less than: <=" and "equal: ===".');
        }
    }
}

function getBacktestResult(payload: BacktestIOResponse): string | number | ServerBacktestResult<string | BacktestTaskResult> {
    let { result } = payload

    return isNumber(result) ? result : JSON.parse(<string>result);
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
