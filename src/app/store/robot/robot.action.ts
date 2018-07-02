import { Action } from '@ngrx/store';

import {
    CommandRobotRequest,
    DeleteRobotRequest,
    GetRobotListRequest,
    ModifyRobotRequest,
    PluginRunRequest,
    SaveRobotRequest,
    SetRobotWDRequest,
    StopRobotRequest,
    SubscribeRobotRequest,
    WsRequest,
} from '../../interfaces/request.interface';
import {
    CommandRobotResponse,
    DeleteRobotResponse,
    GetRobotListResponse,
    ModifyRobotResponse,
    PluginRunResponse,
    SaveRobotResponse,
    ServerSendRobotMessage,
    StopRobotResponse,
    SubscribeRobotResponse,
} from '../../interfaces/response.interface';
import { ImportedArg } from '../../robot/robot.interface';
import { ApiAction } from '../base.action';
import { VariableOverview } from './../../interfaces/app.interface';
import {
    GetRobotDetailRequest,
    GetRobotLogsRequest,
    PublicRobotRequest,
    RestartRobotRequest,
} from './../../interfaces/request.interface';
import {
    GetRobotDetailResponse,
    GetRobotLogsResponse,
    PublicRobotResponse,
    RestartRobotResponse,
} from './../../interfaces/response.interface';


/** =====================================================Server send event========================================= **/

export const RECEIVE_SERVER_SEND_ROBOT_EVENT = '[Robot] RECEIVE_SERVER_SEND_ROBOT_EVENT';

export class ReceiveServerSendRobotEventAction implements Action {
    readonly type = RECEIVE_SERVER_SEND_ROBOT_EVENT;

    constructor(public payload: ServerSendRobotMessage) { }
}

/** =====================================================Robot list========================================= **/

export enum RobotListOrder {
    start,
    limit,
    status,
    length
}

class GetRobotListAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'GetRobotList';

    order = RobotListOrder;

    constructor() { super() }
}

export const GET_ROBOT_LIST = '[Robot] GET_ROBOT_LIST';

export class GetRobotListRequestAction extends GetRobotListAction implements Action {
    readonly type = GET_ROBOT_LIST;

    public allowSeparateRequest = true;

    constructor(public payload: GetRobotListRequest) { super() }
}

export const GET_ROBOT_LIST_FAIL = '[Robot] GET_ROBOT_LIST_FAIL';

export class GetRobotListFailAction extends GetRobotListAction implements Action {
    readonly type = GET_ROBOT_LIST_FAIL;

    constructor(public payload: GetRobotListResponse) { super() }
}

export const GET_ROBOT_LIST_SUCCESS = '[Robot] GET_ROBOT_LIST_SUCCESS';

export class GetRobotListSuccessAction extends GetRobotListAction implements Action {
    readonly type = GET_ROBOT_LIST_SUCCESS;

    constructor(public payload: GetRobotListResponse) { super() }
}

/** =====================================================Public robot========================================= **/

export enum PublicRobotOrder {
    id,
    type,
    length
}

class PublicRobotAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    command = 'PublicRobot';

    order = PublicRobotOrder;

    constructor() { super() };
}

export const PUBLIC_ROBOT = '[Robot] PUBLISH_ROBOT';

export class PublicRobotRequestAction extends PublicRobotAction implements Action {
    readonly type = PUBLIC_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: PublicRobotRequest) { super() }
}

export const PUBLIC_ROBOT_FAIL = '[Robot] PUBLISH_ROBOT_FAIL';

export class PublicRobotFailAction extends PublicRobotAction implements Action {
    readonly type = PUBLIC_ROBOT_FAIL;

    constructor(public payload: PublicRobotResponse) { super() }
}

export const PUBLIC_ROBOT_SUCCESS = '[Robot] PUBLISH_ROBOT_SUCCESS';

export class PublicRobotSuccessAction extends PublicRobotAction implements Action {
    readonly type = PUBLIC_ROBOT_SUCCESS;

    constructor(public payload: PublicRobotResponse) { super() }
}

/** =====================================================Robot Detail========================================= **/

class GetRobotDetailAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'GetRobotDetail';

    order = null;

    constructor() { super() }
}

export const GET_ROBOT_DETAIL = '[Robot] GET_ROBOT_DETAIL';

export class GetRobotDetailRequestAction extends GetRobotDetailAction implements Action {
    readonly type = GET_ROBOT_DETAIL;

    allowSeparateRequest = true;

    constructor(public payload: GetRobotDetailRequest) { super() }
}

export const GET_ROBOT_DETAIL_FAIL = '[Robot] GET_ROBOT_DETAIL_FAIL';

export class GetRobotDetailFailAction extends GetRobotDetailAction implements Action {
    readonly type = GET_ROBOT_DETAIL_FAIL;

    constructor(public payload: GetRobotDetailResponse) { super() }
}

export const GET_ROBOT_DETAIL_SUCCESS = '[Robot] GET_ROBOT_DETAIL_SUCCESS';

export class GetRobotDetailSuccessAction extends GetRobotDetailAction implements Action {
    readonly type = GET_ROBOT_DETAIL_SUCCESS;

    constructor(public payload: GetRobotDetailResponse) { super() }
}

/** =====================================================Robot Subscribe========================================= **/

class SubscribeRobotAction extends ApiAction {
    isSingleParams = true;

    order = null;

    command = 'SubscribeRobot';

    noneParams = false;

    constructor() { super() }
}

export const SUBSCRIBE_ROBOT = '[Robot] SUBSCRIBE_ROBOT';

export class SubscribeRobotRequestAction extends SubscribeRobotAction implements Action {
    readonly type = SUBSCRIBE_ROBOT;

    // allowSeparateRequest = true;

    constructor(public payload: SubscribeRobotRequest, public allowSeparateRequest: boolean) { super() }
}

export const SUBSCRIBE_ROBOT_FAIL = '[Robot] SUBSCRIBE_ROBOT_FAIL';

export class SubscribeRobotFailAction extends SubscribeRobotAction implements Action {
    readonly type = SUBSCRIBE_ROBOT_FAIL;

    constructor(public payload: SubscribeRobotResponse) { super() }
}

export const SUBSCRIBE_ROBOT_SUCCESS = '[Robot] SUBSCRIBE_ROBOT_SUCCESS';

export class SubscribeRobotSuccessAction extends SubscribeRobotAction implements Action {
    readonly type = SUBSCRIBE_ROBOT_SUCCESS;

    constructor(public payload: SubscribeRobotResponse) { super() }
}

/** =====================================================Robot logs========================================= **/

export enum RobotLogsOrder {
    robotId,
    logMinId,
    logMaxId,
    logOffset,
    logLimit,
    profitMinId,
    profitMaxId,
    profitOffset,
    profitLimit,
    chartMinId,
    chartMaxId,
    chartOffset,
    chartLimit,
    chartUpdateBaseId,
    chartUpdateTime,
    length
}

class GetRobotLogsAction extends ApiAction {
    isSingleParams = false;

    command = 'GetRobotLogs';

    noneParams = false;

    order = RobotLogsOrder;

    constructor() { super() }
}

export const GET_ROBOT_LOGS = '[Robot] GET_ROBOT_LOGS';

export class GetRobotLogsRequestAction extends GetRobotLogsAction implements Action {
    readonly type = GET_ROBOT_LOGS;

    constructor(public payload: GetRobotLogsRequest, public allowSeparateRequest: boolean, public isSyncAction = false) { super() }
}

export const GET_ROBOT_LOGS_FAIL = '[Robot] GET_ROBOT_LOGS_FAIL';

export class GetRobotLogsFailAction extends GetRobotLogsAction implements Action {
    readonly type = GET_ROBOT_LOGS_FAIL;

    constructor(public payload: GetRobotLogsResponse) { super() }
}

export const GET_ROBOT_LOGS_SUCCESS = '[Robot] GET_ROBOT_LOGS_SUCCESS';

export class GetRobotLogsSuccessAction extends GetRobotLogsAction implements Action {
    readonly type = GET_ROBOT_LOGS_SUCCESS;

    constructor(public payload: GetRobotLogsResponse) { super() }
}

/** =====================================================Robot restart========================================= **/

class RestartRobotAction extends ApiAction {
    isSingleParams = true;

    command = 'RestartRobot';

    noneParams = false;

    order = null;

    constructor() { super() }
}

export const RESTART_ROBOT = '[Robot] RESTART_ROBOT';

export class RestartRobotRequestAction extends RestartRobotAction implements Action {
    readonly type = RESTART_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: RestartRobotRequest) { super() }
}

export const RESTART_ROBOT_FAIL = '[Robot] RESTART_ROBOT_FAIL';

export class RestartRobotFailAction extends RestartRobotAction implements Action {
    readonly type = RESTART_ROBOT_FAIL;

    constructor(public payload: RestartRobotResponse) { super() }
}

export const RESTART_ROBOT_SUCCESS = '[Robot] RESTART_ROBOT_SUCCESS';

export class RestartRobotSuccessAction extends RestartRobotAction implements Action {
    readonly type = RESTART_ROBOT_SUCCESS;

    constructor(public payload: RestartRobotResponse) { super() }
}

/** =====================================================Robot stop========================================= **/

class StopRobotAction extends ApiAction {
    isSingleParams = true;

    command = 'StopRobot';

    noneParams = false;

    order = null;

    constructor() { super() }
}

export const STOP_ROBOT = '[Robot] STOP_ROBOT';

export class StopRobotRequestAction extends StopRobotAction implements Action {
    readonly type = STOP_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: StopRobotRequest) { super() }
}

export const STOP_ROBOT_FAIL = '[Robot] STOP_ROBOT_FAIL';

export class StopRobotFailAction extends StopRobotAction implements Action {
    readonly type = STOP_ROBOT_FAIL;

    constructor(public payload: StopRobotResponse) { super() }
}

export const STOP_ROBOT_SUCCESS = '[Robot] STOP_ROBOT_SUCCESS';

export class StopRobotSuccessAction extends StopRobotAction implements Action {
    readonly type = STOP_ROBOT_SUCCESS;

    constructor(public payload: StopRobotResponse) { super() }
}

/** ======================================================Modify robot========================================= **/

export enum ModifyRobotOrder {
    id,
    name,
    nodeId,
    kLinePeriodId,
    platform,
    stocks,
    args,
    length
}

class ModifyRobotAction extends ApiAction {
    isSingleParams = false;

    command = 'ModifyRobot';

    order = ModifyRobotOrder;

    noneParams = false;

    constructor() { super() }
}

export const MODIFY_ROBOT = '[Robot] MODIFY_ROBOT';

export class ModifyRobotRequestAction extends ModifyRobotAction implements Action {
    readonly type = MODIFY_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: ModifyRobotRequest) { super() };
}

export const MODIFY_ROBOT_FAIL = '[Robot] MODIFY_ROBOT_FAIL';

export class ModifyRobotFailAction extends ModifyRobotAction implements Action {
    readonly type = MODIFY_ROBOT_FAIL;

    constructor(public payload: ModifyRobotResponse) { super() }
}

export const MODIFY_ROBOT_SUCCESS = '[Robot] MODIFY_ROBOT_SUCCESS';

export class ModifyRobotSuccessAction extends ModifyRobotAction implements Action {
    readonly type = MODIFY_ROBOT_SUCCESS;

    constructor(public payload: ModifyRobotResponse) { super() }
}

/** ======================================================Command robot========================================= **/

export enum CommandRobotOrder {
    id,
    command,
    length
}

export class CommandRobotAction extends ApiAction {
    isSingleParams = false;

    order = CommandRobotOrder;

    noneParams = false;

    command = 'CommandRobot';

    constructor() { super() };
}

export const COMMAND_ROBOT = '[Robot] COMMAND_ROBOT';

export class CommandRobotRequestAction extends CommandRobotAction implements Action {
    readonly type = COMMAND_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: CommandRobotRequest) { super() }
}

export const COMMAND_ROBOT_FAIL = '[Robot] COMMAND_ROBOT_FAIL';

export class CommandRobotFailAction extends CommandRobotAction implements Action {
    readonly type = COMMAND_ROBOT_FAIL;

    constructor(public payload: CommandRobotResponse) { super() }
}

export const COMMAND_ROBOT_SUCCESS = '[Robot] COMMAND_ROBOT_SUCCESS';

export class CommandRobotSuccessAction extends CommandRobotAction implements Action {
    readonly type = COMMAND_ROBOT_SUCCESS;

    constructor(public payload: CommandRobotResponse) { super() }
}

/** ======================================================Delete robot========================================= **/

export enum DeleteRobotOrder {
    id,
    checked,
    length
}

export class DeleteRobotAction extends ApiAction {
    isSingleParams = false;

    order = DeleteRobotOrder;

    noneParams = false;

    command = 'DeleteRobot';

    constructor() { super() };
}

export const DELETE_ROBOT = '[Robot] DELETE_ROBOT';

export class DeleteRobotRequestAction extends DeleteRobotAction implements Action {
    readonly type = DELETE_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: DeleteRobotRequest) { super() }
}

export const DELETE_ROBOT_FAIL = '[Robot] DELETE_ROBOT_FAIL';

export class DeleteRobotFailAction extends DeleteRobotAction implements Action {
    readonly type = DELETE_ROBOT_FAIL;

    constructor(public payload: DeleteRobotResponse) { super() }
}

export const DELETE_ROBOT_SUCCESS = '[Robot] DELETE_ROBOT_SUCCESS';

export class DeleteRobotSuccessAction extends DeleteRobotAction implements Action {
    readonly type = DELETE_ROBOT_SUCCESS;

    constructor(public payload: DeleteRobotResponse) { super() }
}

/** ======================================================Create robot========================================= **/

export enum SaveRobotOrder {
    name,
    args,
    strategyId,
    kLineId,
    pairExchanges,
    pairStocks,
    nodeId,
    length
}

export class SaveRobotAction extends ApiAction {
    isSingleParams = false;

    noneParams = false;

    order = SaveRobotOrder;

    command = 'SaveRobot';

    constructor() { super() };
}

export const SAVE_ROBOT = '[Robot] SAVE_ROBOT';

export class SaveRobotRequestAction extends SaveRobotAction implements Action {
    readonly type = SAVE_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: SaveRobotRequest) { super() }
}

export const SAVE_ROBOT_FAIL = '[Robot] SAVE_ROBOT_FAIL';

export class SaveRobotFailAction extends SaveRobotAction implements Action {
    readonly type = SAVE_ROBOT_FAIL;

    constructor(public payload: SaveRobotResponse) { super() }
}

export const SAVE_ROBOT_SUCCESS = '[Robot] SAVE_ROBOT_SUCCESS';

export class SaveRobotSuccessAction extends SaveRobotAction implements Action {
    readonly type = SAVE_ROBOT_SUCCESS;

    constructor(public payload: SaveRobotResponse) { super() }
}

/** ======================================================Plugin run========================================= **/

export class PluginRunAction extends ApiAction {
    isSingleParams = true;

    noneParams = false;

    command = 'PluginRun';

    order = null;

    getParams(params: any): WsRequest {
        return { method: [this.command], params: [[JSON.stringify(params)]], callbackId: this.command };
    }

    constructor() { super() };
}

export const RUN_PLUGIN = '[Robot] RUN_PLUGIN';

export class PluginRunRequestAction extends PluginRunAction implements Action {
    readonly type = RUN_PLUGIN;

    allowSeparateRequest = true;

    constructor(public payload: PluginRunRequest) { super() }
}

export const RUN_PLUGIN_FAIL = '[Robot] RUN_PLUGIN_FAIL';

export class PluginRunFailAction extends PluginRunAction implements Action {
    readonly type = RUN_PLUGIN_FAIL;

    constructor(public payload: PluginRunResponse) { super() }
}

export const RUN_PLUGIN_SUCCESS = '[Robot] RUN_PLUGIN_SUCCESS';

export class PluginRunSuccessAction extends PluginRunAction implements Action {
    readonly type = RUN_PLUGIN_SUCCESS;

    constructor(public payload: PluginRunResponse) { super() }
}

/** ======================================================Local action========================================= **/

export const RESET_ROBOT_DETAIL = '[Robot] RESET_ROBOT_DETAIL';

export class ResetRobotDetailAction implements Action {
    readonly type = RESET_ROBOT_DETAIL;

    constructor() { }
}

export const RESET_ROBOT_OPERATE = '[Robot] RESET_ROBOT_OPERATE';

export class ResetRobotOperateAction implements Action {
    readonly type = RESET_ROBOT_OPERATE;

    constructor() { }
}

export const MODIFY_ROBOT_ARG = '[Robot] MODIFY_ROBOT_ARG';

export class ModifyRobotArgAction implements Action {
    readonly type = MODIFY_ROBOT_ARG;

    constructor(public payload: VariableOverview | ImportedArg, public templateFlag?: string | number) { }
}

export const MODIFY_DEFAULT_PARAMS = '[Robot] MODIFY_DEFAULT_PARAMS';

export class ModifyDefaultParamsAction implements Action {
    readonly type = MODIFY_DEFAULT_PARAMS;

    // key: path of the target key; value: value to be modified.
    constructor(public payload: Map<string[], any>) { }
}

export const MONITOR_SOUND_TYPES = '[Robot] MONITOR_SOUND_TYPES';

export class MonitorSoundTypeAction implements Action {
    readonly type = MONITOR_SOUND_TYPES;

    constructor(public payload: number[]) { }
}

export const TOGGLE_MONITOR_SOUND = '[Robot] TOGGLE_MONITOR_SOUND';

export class ToggleMonitorSoundAction implements Action {
    readonly type = TOGGLE_MONITOR_SOUND;

    constructor(public payload: boolean) { }
}

export const CHANGE_LOG_PAGE = '[Robot] CHANGE_LOG_PAGE';

export class ChangeLogPageAction implements Action {
    readonly type = CHANGE_LOG_PAGE;

    constructor(public payload: number) { }
}

export const CHANGE_PROFIT_CHART_PAGE = '[Robot] CHANGE_PROFIT_CHART_PAGE';

export class ChangeProfitChartPageAction implements Action {
    readonly type = CHANGE_PROFIT_CHART_PAGE;

    constructor(public payload: number) { }
}

export const CHANGE_STRATEGY_CHART_PAGE = '[Robot] CHANGE_STRATEGY_CHART_PAGE';

export class ChangeStrategyChartPageAction implements Action {
    readonly type = CHANGE_STRATEGY_CHART_PAGE;

    constructor(public payload: number) { }
}

export const UPDATE_ROBOT_WATCH_DOG_STATE = '[Robot] UPDATE_ROBOT_WATCH_DOG_STATE';

export class UpdateRobotWatchDogStateAction implements Action {
    readonly type = UPDATE_ROBOT_WATCH_DOG_STATE;

    constructor(public payload: SetRobotWDRequest) { }
}

export type ApiActions = GetRobotListRequestAction
    | CommandRobotFailAction
    | CommandRobotRequestAction
    | CommandRobotSuccessAction
    | DeleteRobotFailAction
    | DeleteRobotRequestAction
    | DeleteRobotSuccessAction
    | GetRobotDetailFailAction
    | GetRobotDetailRequestAction
    | GetRobotDetailSuccessAction
    | GetRobotListFailAction
    | GetRobotListSuccessAction
    | GetRobotLogsFailAction
    | GetRobotLogsRequestAction
    | GetRobotLogsSuccessAction
    | ModifyRobotFailAction
    | ModifyRobotRequestAction
    | ModifyRobotSuccessAction
    | PluginRunRequestAction
    | PluginRunFailAction
    | PluginRunSuccessAction
    | PublicRobotFailAction
    | PublicRobotRequestAction
    | PublicRobotSuccessAction
    | RestartRobotFailAction
    | RestartRobotRequestAction
    | RestartRobotSuccessAction
    | SaveRobotRequestAction
    | SaveRobotFailAction
    | SaveRobotSuccessAction
    | StopRobotFailAction
    | StopRobotRequestAction
    | StopRobotSuccessAction
    | SubscribeRobotFailAction
    | SubscribeRobotRequestAction
    | SubscribeRobotSuccessAction

export type Actions = ApiActions
    | ChangeLogPageAction
    | ChangeProfitChartPageAction
    | ChangeStrategyChartPageAction
    | ModifyDefaultParamsAction
    | ModifyRobotArgAction
    | MonitorSoundTypeAction
    | ReceiveServerSendRobotEventAction
    | ResetRobotDetailAction
    | ResetRobotOperateAction
    | ToggleMonitorSoundAction
    | UpdateRobotWatchDogStateAction

export const ResponseActions = {
    CommandRobotFailAction,
    CommandRobotSuccessAction,
    DeleteRobotFailAction,
    DeleteRobotSuccessAction,
    GetRobotDetailFailAction,
    GetRobotDetailSuccessAction,
    GetRobotListFailAction,
    GetRobotListSuccessAction,
    GetRobotLogsFailAction,
    GetRobotLogsSuccessAction,
    ModifyRobotFailAction,
    ModifyRobotSuccessAction,
    PluginRunFailAction,
    PluginRunSuccessAction,
    PublicRobotFailAction,
    PublicRobotSuccessAction,
    RestartRobotFailAction,
    RestartRobotSuccessAction,
    SaveRobotFailAction,
    SaveRobotSuccessAction,
    StopRobotFailAction,
    StopRobotSuccessAction,
    SubscribeRobotFailAction,
    SubscribeRobotSuccessAction,
}
