import { Action } from '@ngrx/store';

import { Filter } from '../../backtest/arg-optimizer/arg-optimizer.component';
import { BacktestCode, BacktestSelectedPair, TimeRange } from '../../backtest/backtest.interface';
import { BacktestIORequest, GetTemplatesRequest } from '../../interfaces/request.interface';
import { BacktestIOResponse, GetTemplatesResponse, ServerSendBacktestMessage } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

/** =====================================================Server send event========================================= **/

export const RECEIVE_SERVER_SEND_BACKTEST_EVENT = '[Backtest] RECEIVE_SERVER_SEND_BACKTEST_EVENT';

export class ReceiveServerSendBacktestEventAction implements Action {
    readonly type = RECEIVE_SERVER_SEND_BACKTEST_EVENT;

    constructor(public payload: ServerSendBacktestMessage) { }
}

/* ===========================================Api action=================================== */

// get templates
class GetTemplatesAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    order = null;

    command = 'GetTemplates';

    allowSeparateRequest = true;

    constructor() { super() };
}

export const GET_TEMPLATES = '[Backtest] GET_TEMPLATES';

export class GetTemplatesRequestAction extends GetTemplatesAction implements Action {
    readonly type = GET_TEMPLATES;

    constructor(public payload: GetTemplatesRequest) { super() };
}

export const GET_TEMPLATES_FAIL = '[Backtest] GET_TEMPLATES_FAIL';

export class GetTemplatesFailAction extends GetTemplatesAction implements Action {
    readonly type = GET_TEMPLATES_FAIL;

    constructor(public payload: GetTemplatesResponse) { super() };
}

export const GET_TEMPLATES_SUCCESS = '[Backtest] GET_TEMPLATES_SUCCESS';

export class GetTemplatesSuccessAction extends GetTemplatesAction implements Action {
    readonly type = GET_TEMPLATES_SUCCESS;

    constructor(public payload: GetTemplatesResponse) { super() };
}

// backtest io
export enum BacktestIOOrder {
    nodeId,
    language,
    io,
    length
}

class BacktestIOAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'BacktestIO';

    order = BacktestIOOrder;

    allowSeparateRequest = true;

    constructor() { super() };
}

export const EXECUTE_BACKTEST = '[Backtest] EXECUTE_BACKTEST';

export class BacktestIORequestAction extends BacktestIOAction implements Action {
    readonly type = EXECUTE_BACKTEST;

    constructor(public payload: BacktestIORequest) { super() }
}

export const EXECUTE_BACKTEST_FAIL = '[Backtest] EXECUTE_BACKTEST_FAIL';

export class BacktestIOFailAction extends BacktestIOAction implements Action {
    readonly type = EXECUTE_BACKTEST_FAIL;

    constructor(public payload: BacktestIOResponse) { super() };
}

export const EXECUTE_BACKTEST_SUCCESS = '[Backtest] EXECUTE_BACKTEST_SUCCESS';

export class BacktestIOSuccessAction extends BacktestIOAction implements Action {
    readonly type = EXECUTE_BACKTEST_SUCCESS;

    constructor(public payload: BacktestIOResponse) { super() };
}

/* ===========================================Local action=================================== */

export const UPDATE_SELECTED_KLINE_PERIOD = '[Backtest] UPDATE_SELECTED_KLINE_PERIOD';

export class UpdateSelectedKlinePeriodAction implements Action {
    readonly type = UPDATE_SELECTED_KLINE_PERIOD;

    constructor(public payload: number) { }
}

export const UPDATE_SELECTED_TIME_RANGE = '[Backtest] UPDATE_SELECTED_TIME_RANGE';

export class UpdateSelectedTimeRangeAction implements Action {
    readonly type = UPDATE_SELECTED_TIME_RANGE;

    constructor(public payload: TimeRange) { }
}

export const UPDATE_FLOOR_KLINE_PERIOD = '[Backtest] UPDATE_FLOOR_KLINE_PERIOD';

export class UpdateFloorKlinePeriodAction implements Action {
    readonly type = UPDATE_FLOOR_KLINE_PERIOD;

    constructor(public payload: number) { }
}

export const UPDATE_BACKTEST_ADVANCED_OPTION = '[Backtest] UPDATE_BACKTEST_ADVANCED_OPTION';

export class UpdateBacktestAdvancedOption implements Action {
    readonly type = UPDATE_BACKTEST_ADVANCED_OPTION;

    constructor(public payload: { [key: string]: number }) { }
}

export const UPDATE_BACKTEST_PLATFORM_OPTION = '[Backtest] UPDATE_BACKTEST_PLATFORM_OPTION';

export class UpdateBacktestPlatformOptionAction implements Action {
    readonly type = UPDATE_BACKTEST_PLATFORM_OPTION;

    constructor(public payload: BacktestSelectedPair[]) { }
}

export const UPDATE_RUNNING_NODE = '[Backtest] UPDATE_RUNNING_NODE';

export class UpdateBacktestRunningNodeAction implements Action {
    readonly type = UPDATE_RUNNING_NODE;

    constructor(public payload: number) { }
}

export const TOGGLE_BACKTEST_MODE = '[Backtest] TOGGLE_BACKTEST_MODE';

export class ToggleBacktestModeAction implements Action {
    readonly type = TOGGLE_BACKTEST_MODE;

    constructor() { }
}

export const UPDATE_BACKTEST_CODE = '[Backtest] UPDATE_BACKTEST_CODE';

export class UpdateBacktestCodeAction implements Action {
    readonly type = UPDATE_BACKTEST_CODE;

    constructor(public payload: BacktestCode) { }
}

export const CHECK_BACKTEST_TEMPLATE_CODE = '[Backtest] CHECK_BACKTEST_TEMPLATE_CODE';

export class CheckBacktestTemplateCodeAction implements Action {
    readonly type = CHECK_BACKTEST_TEMPLATE_CODE;

    constructor(public payload: number[]) { }
}

export const UPDATE_BACKTEST_ARG_FILTER ='[Backtest] UPDATE_BACKTEST_ARG_FILTER';

export class UpdateBacktestArgFilterAction implements Action {
    readonly type = UPDATE_BACKTEST_ARG_FILTER;

    constructor(public payload: Filter[]) { }
}

export const GENERATE_TO_BE_TESTED_VALUES = '[Backtest] GENERATE_TO_BE_TESTED_VALUES';

export class GenerateToBeTestedValuesAction implements Action {
    readonly type = GENERATE_TO_BE_TESTED_VALUES;

    constructor() { }
}

export const UPDATE_BACKTEST_LEVEL = '[Backtest] UPDATE_BACKTEST_LEVEL';

export class UpdateBacktestLevelAction implements Action {
    readonly type = UPDATE_BACKTEST_LEVEL;

    constructor(public payload: number) { }
}

export type ApiActions = GetTemplatesRequestAction
    | GetTemplatesFailAction
    | GetTemplatesSuccessAction
    | BacktestIORequestAction
    | BacktestIOFailAction
    | BacktestIOSuccessAction

export type Actions = ApiActions
    | UpdateSelectedKlinePeriodAction
    | UpdateFloorKlinePeriodAction
    | UpdateBacktestAdvancedOption
    | UpdateSelectedTimeRangeAction
    | UpdateBacktestPlatformOptionAction
    | UpdateBacktestRunningNodeAction
    | ToggleBacktestModeAction
    | UpdateBacktestCodeAction
    | CheckBacktestTemplateCodeAction
    | UpdateBacktestArgFilterAction
    | GenerateToBeTestedValuesAction
    | UpdateBacktestLevelAction
    | ReceiveServerSendBacktestEventAction

export const ResponseActions = {
    GetTemplatesFailAction,
    GetTemplatesSuccessAction,
    BacktestIOFailAction,
    BacktestIOSuccessAction,
}
