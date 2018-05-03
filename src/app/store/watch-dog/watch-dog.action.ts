import { Action } from '@ngrx/store';

import { SetRobotWDRequest } from '../../interfaces/request.interface';
import { ApiAction } from '../base.action';
import { SetRobotWDResponse } from './../../interfaces/response.interface';

/* ===========================================Api action=================================== */

export enum SetRobotWDOrder {
    robotId,
    watchDogStatus,
    length
}

// set watch dog 
export class SetRobotWDAction extends ApiAction {
    isSingleParams = false;

    command = 'SetRobotWD';

    order = SetRobotWDOrder;

    noneParams = false;

    constructor() { super() };
}

export const SET_ROBOT_WATCH_DOG = 'SET_ROBOT_WATCH_DOG';

export class SetRobotWDRequestAction extends SetRobotWDAction implements Action {
    readonly type = SET_ROBOT_WATCH_DOG;

    allowSeparateRequest = true;

    constructor(public payload: SetRobotWDRequest) { super() }
}

export const SET_ROBOT_WATCH_DOG_FAIL = 'SET_ROBOT_WATCH_DOG_FAIL';

export class SetRobotWDFailAction extends SetRobotWDAction implements Action {
    readonly type = SET_ROBOT_WATCH_DOG_FAIL;

    constructor(public payload: SetRobotWDResponse) { super() }
}

export const SET_ROBOT_WATCH_DOG_SUCCESS = 'SET_ROBOT_WATCH_DOG_SUCCESS';

export class SetRobotWDSuccessAction extends SetRobotWDAction implements Action {
    readonly type = SET_ROBOT_WATCH_DOG_SUCCESS;

    constructor(public payload: SetRobotWDResponse) { super() }
}

/* ===========================================Local action=================================== */

/* none local action */

export type ApiActions = SetRobotWDRequestAction
    | SetRobotWDFailAction
    | SetRobotWDSuccessAction

export type Actions = ApiActions

export const ResponseActions = {
    SetRobotWDFailAction,
    SetRobotWDSuccessAction
}