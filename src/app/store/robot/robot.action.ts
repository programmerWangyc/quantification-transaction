import { Action } from '@ngrx/store';

import { GetRobotListRequest } from '../../interfaces/request.interface';
import { GetRobotListResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

export enum RobotListOrder {
    start,
    limit,
    status,
    length
}

export class GetRobotListAction extends ApiAction {
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

export type ApiActions = GetRobotListRequestAction
    | GetRobotListFailAction
    | GetRobotListSuccessAction

export type Actions = ApiActions


export const ResponseActions = {
    GetRobotListFailAction,
    GetRobotListSuccessAction,
}