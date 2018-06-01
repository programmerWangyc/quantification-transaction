import { Action } from '@ngrx/store';

import { RouterInfo } from '../../interfaces/app.interface';

export const GO = '[Router] Go';
export const BACK = '[Router] Back';
export const FORWARD = '[Router] Forward';

export class Go implements Action {
    readonly type = GO;

    constructor(public payload: RouterInfo) { }
}

export class Back implements Action {
    readonly type = BACK;
}

export class Forward implements Action {
    readonly type = FORWARD;
}

export type RouterActionsUnion = Go | Back | Forward;
