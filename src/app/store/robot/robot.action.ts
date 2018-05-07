import { Action } from '@ngrx/store';

import {
    CommandRobotRequest,
    GetRobotListRequest,
    ModifyRobotRequest,
    StopRobotRequest,
    SubscribeRobotRequest,
} from '../../interfaces/request.interface';
import {
    CommandRobotResponse,
    GetRobotListResponse,
    ModifyRobotResponse,
    ServerSendRobotMessage,
    StopRobotResponse,
    SubscribeRobotResponse,
} from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';
import { ImportedArg, VariableOverview } from './../../interfaces/constant.interface';
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

export const RECEIVE_SERVER_SEND_ROBOT_EVENT = 'RECEIVE_SERVER_SEND_ROBOT_EVENT';

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

export const GET_ROBOT_LIST = 'GET_ROBOT_LIST';

export class GetRobotListRequestAction extends GetRobotListAction implements Action {
    readonly type = GET_ROBOT_LIST;

    public allowSeparateRequest = true;

    constructor(public payload: GetRobotListRequest) { super() }
}

export const GET_ROBOT_LIST_FAIL = 'GET_ROBOT_LIST_FAIL';

export class GetRobotListFailAction extends GetRobotListAction implements Action {
    readonly type = GET_ROBOT_LIST_FAIL;

    constructor(public payload: GetRobotListResponse) { super() }
}

export const GET_ROBOT_LIST_SUCCESS = 'GET_ROBOT_LIST_SUCCESS';

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

export const PUBLIC_ROBOT = 'PUBLISH_ROBOT';

export class PublicRobotRequestAction extends PublicRobotAction implements Action {
    readonly type = PUBLIC_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: PublicRobotRequest) { super() }
}

export const PUBLIC_ROBOT_FAIL = 'PUBLISH_ROBOT_FAIL';

export class PublicRobotFailAction extends PublicRobotAction implements Action {
    readonly type = PUBLIC_ROBOT_FAIL;

    constructor(public payload: PublicRobotResponse) { super() }
}

export const PUBLIC_ROBOT_SUCCESS = 'PUBLISH_ROBOT_SUCCESS';

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

export const GET_ROBOT_DETAIL = 'GET_ROBOT_DETAIL';

export class GetRobotDetailRequestAction extends GetRobotDetailAction implements Action {
    readonly type = GET_ROBOT_DETAIL;

    allowSeparateRequest = true;

    constructor(public payload: GetRobotDetailRequest) { super() }
}

export const GET_ROBOT_DETAIL_FAIL = 'GET_ROBOT_DETAIL_FAIL';

export class GetRobotDetailFailAction extends GetRobotDetailAction implements Action {
    readonly type = GET_ROBOT_DETAIL_FAIL;

    constructor(public payload: GetRobotDetailResponse) { super() }
}

export const GET_ROBOT_DETAIL_SUCCESS = 'GET_ROBOT_DETAIL_SUCCESS';

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

export const SUBSCRIBE_ROBOT = 'SUBSCRIBE_ROBOT';

export class SubscribeRobotRequestAction extends SubscribeRobotAction implements Action {
    readonly type = SUBSCRIBE_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: SubscribeRobotRequest) { super() }
}

export const SUBSCRIBE_ROBOT_FAIL = 'SUBSCRIBE_ROBOT_FAIL';

export class SubscribeRobotFailAction extends SubscribeRobotAction implements Action {
    readonly type = SUBSCRIBE_ROBOT_FAIL;

    constructor(public payload: SubscribeRobotResponse) { super() }
}

export const SUBSCRIBE_ROBOT_SUCCESS = 'SUBSCRIBE_ROBOT_SUCCESS';

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

export const GET_ROBOT_LOGS = 'GET_ROBOT_LOGS';

export class GetRobotLogsRequestAction extends GetRobotLogsAction implements Action {
    readonly type = GET_ROBOT_LOGS;

    constructor(public payload: GetRobotLogsRequest, public allowSeparateRequest: boolean) { super() }
}

export const GET_ROBOT_LOGS_FAIL = 'GET_ROBOT_LOGS_FAIL';

export class GetRobotLogsFailAction extends GetRobotLogsAction implements Action {
    readonly type = GET_ROBOT_LOGS_FAIL;

    constructor(public payload: GetRobotLogsResponse) { super() }
}

export const GET_ROBOT_LOGS_SUCCESS = 'GET_ROBOT_LOGS_SUCCESS';

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

export const RESTART_ROBOT = 'RESTART_ROBOT';

export class RestartRobotRequestAction extends RestartRobotAction implements Action {
    readonly type = RESTART_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: RestartRobotRequest) { super() }
}

export const RESTART_ROBOT_FAIL = 'RESTART_ROBOT_FAIL';

export class RestartRobotFailAction extends RestartRobotAction implements Action {
    readonly type = RESTART_ROBOT_FAIL;

    constructor(public payload: RestartRobotResponse) { super() }
}

export const RESTART_ROBOT_SUCCESS = 'RESTART_ROBOT_SUCCESS';

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

export const STOP_ROBOT = 'STOP_ROBOT';

export class StopRobotRequestAction extends StopRobotAction implements Action {
    readonly type = STOP_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: StopRobotRequest) { super() }
}

export const STOP_ROBOT_FAIL = 'STOP_ROBOT_FAIL';

export class StopRobotFailAction extends StopRobotAction implements Action {
    readonly type = STOP_ROBOT_FAIL;

    constructor(public payload: StopRobotResponse) { super() }
}

export const STOP_ROBOT_SUCCESS = 'STOP_ROBOT_SUCCESS';

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

export const MODIFY_ROBOT = 'MODIFY_ROBOT';

export class ModifyRobotRequestAction extends ModifyRobotAction implements Action {
    readonly type = MODIFY_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: ModifyRobotRequest) { super() };
}

export const MODIFY_ROBOT_FAIL = 'MODIFY_ROBOT_FAIL';

export class ModifyRobotFailAction extends ModifyRobotAction implements Action {
    readonly type = MODIFY_ROBOT_FAIL;

    constructor(public payload: ModifyRobotResponse) { super() }
}

export const MODIFY_ROBOT_SUCCESS = 'MODIFY_ROBOT_SUCCESS';

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

export const COMMAND_ROBOT = 'COMMAND_ROBOT';

export class CommandRobotRequestAction extends CommandRobotAction implements Action {
    readonly type = COMMAND_ROBOT;

    allowSeparateRequest = true;

    constructor(public payload: CommandRobotRequest) { super() }
}

export const COMMAND_ROBOT_FAIL = 'COMMAND_ROBOT_FAIL';

export class CommandRobotFailAction extends CommandRobotAction implements Action {
    readonly type = COMMAND_ROBOT_FAIL;

    constructor(public payload: CommandRobotResponse) { super() }
}

export const COMMAND_ROBOT_SUCCESS = 'COMMAND_ROBOT_SUCCESS';

export class CommandRobotSuccessAction extends CommandRobotAction implements Action {
    readonly type = COMMAND_ROBOT_SUCCESS;

    constructor(public payload: CommandRobotResponse) { super() }
}

/** ======================================================Local action========================================= **/

export const RESET_ROBOT_DETAIL = 'RESET_ROBOT_DETAIL';

export class ResetRobotDetailAction implements Action {
    readonly type = RESET_ROBOT_DETAIL;

    constructor() { }
}

export const MODIFY_ROBOT_ARG = 'MODIFY_ROBOT_ARG';

export class ModifyRobotArgAction implements Action {
    readonly type = MODIFY_ROBOT_ARG;

    constructor(public payload: VariableOverview | ImportedArg, public templateFlag?: string | number) { }
}

export const MODIFY_DEFAULT_PARAMS = 'MODIFY_DEFAULT_PARAMS';

export class ModifyDefaultParamsAction implements Action {
    readonly type = MODIFY_DEFAULT_PARAMS;

    // key: path of the target key; value: value to be modified.
    constructor(public payload: Map<string[], any>) { }
}

export const MONITOR_SOUND_TYPES = 'MONITOR_SOUND_TYPES';

export class MonitorSoundTypeAction implements Action {
    readonly type = MONITOR_SOUND_TYPES;

    constructor(public payload: number[]) { }
}

export const TOGGLE_MONITOR_SOUND = 'TOGGLE_MONITOR_SOUND';

export class ToggleMonitorSoundAction implements Action {
    readonly type = TOGGLE_MONITOR_SOUND;

    constructor(public payload: boolean) { }
}

export const CHANGE_LOG_PAGE = 'CHANGE_LOG_PAGE';

export class ChangeLogPageAction implements Action {
    readonly type = CHANGE_LOG_PAGE;

    constructor(public payload: number) { }
}

export type ApiActions = GetRobotListRequestAction
    | GetRobotListFailAction
    | GetRobotListSuccessAction
    | PublicRobotRequestAction
    | PublicRobotFailAction
    | PublicRobotSuccessAction
    | GetRobotDetailRequestAction
    | GetRobotDetailFailAction
    | GetRobotDetailSuccessAction
    | SubscribeRobotRequestAction
    | SubscribeRobotFailAction
    | SubscribeRobotSuccessAction
    | GetRobotLogsRequestAction
    | GetRobotLogsFailAction
    | GetRobotLogsSuccessAction
    | RestartRobotRequestAction
    | RestartRobotFailAction
    | RestartRobotSuccessAction
    | StopRobotRequestAction
    | StopRobotFailAction
    | StopRobotSuccessAction
    | ModifyRobotRequestAction
    | ModifyRobotFailAction
    | ModifyRobotSuccessAction
    | CommandRobotRequestAction
    | CommandRobotFailAction
    | CommandRobotSuccessAction

export type Actions = ApiActions
    | ResetRobotDetailAction
    | ModifyRobotArgAction
    | ModifyDefaultParamsAction
    | MonitorSoundTypeAction
    | ToggleMonitorSoundAction
    | ChangeLogPageAction
    | ReceiveServerSendRobotEventAction

export const ResponseActions = {
    GetRobotListFailAction,
    GetRobotListSuccessAction,
    PublicRobotFailAction,
    PublicRobotSuccessAction,
    GetRobotDetailFailAction,
    GetRobotDetailSuccessAction,
    SubscribeRobotFailAction,
    SubscribeRobotSuccessAction,
    GetRobotLogsFailAction,
    GetRobotLogsSuccessAction,
    RestartRobotFailAction,
    RestartRobotSuccessAction,
    StopRobotFailAction,
    StopRobotSuccessAction,
    ModifyRobotFailAction,
    ModifyRobotSuccessAction,
    CommandRobotFailAction,
    CommandRobotSuccessAction
}