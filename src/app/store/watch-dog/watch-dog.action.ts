import { Action } from '@ngrx/store';

import { SetWDRequest } from '../../interfaces/request.interface';
import { SetWDResponse } from '../../interfaces/response.interface';
import { ApiAction } from '../base.action';

//  ===========================================Api action===================================

export enum SetRobotWDOrder {
    robotId,
    watchDogStatus,
    length,
}

// set watch dog
export class SetRobotWDAction extends ApiAction {
    isSingleParams = false;

    command = 'SetRobotWD';

    order = SetRobotWDOrder;

    noneParams = false;

    constructor() { super(); }
}

export const SET_ROBOT_WATCH_DOG = '[WatchDog] SET_ROBOT_WATCH_DOG';

export class SetWDRequestAction extends SetRobotWDAction implements Action {
    readonly type = SET_ROBOT_WATCH_DOG;

    allowSeparateRequest = true;

    constructor(public payload: SetWDRequest) { super(); }
}

export const SET_ROBOT_WATCH_DOG_FAIL = '[WatchDog] SET_ROBOT_WATCH_DOG_FAIL';

export class SetWDFailAction extends SetRobotWDAction implements Action {
    readonly type = SET_ROBOT_WATCH_DOG_FAIL;

    constructor(public payload: SetWDResponse) { super(); }
}

export const SET_ROBOT_WATCH_DOG_SUCCESS = '[WatchDog] SET_ROBOT_WATCH_DOG_SUCCESS';

export class SetWDSuccessAction extends SetRobotWDAction implements Action {
    readonly type = SET_ROBOT_WATCH_DOG_SUCCESS;

    constructor(public payload: SetWDResponse) { super(); }
}

//  ===========================================Local action===================================

//  none local action

export type ApiActions = SetWDRequestAction
    | SetWDFailAction
    | SetWDSuccessAction;

export type Actions = ApiActions;

export const ResponseActions = {
    SetWDFailAction,
    SetWDSuccessAction,
};
