import { Action } from '@ngrx/store';

import { WsRequest } from '../interfaces/request.interface';

export abstract class ApiAction {

    abstract isSingleParams: boolean;

    abstract command: string;

    abstract order: ArrayLike<string>;

    abstract noneParams: boolean;

    callbackId?: any;

    private orderParams(payload: any, defaultValue): any[] {
        return new Array(this.order.length).fill(defaultValue).map((_, index) => {
            const result = payload[this.order[index]];

            return result === undefined ? defaultValue : result;
        });
    }

    private getParam(payload: any): any[] {
        return Object.keys(payload).map(key => payload[key]);
    }

    getParams(payload: any, defaultValue = ''): WsRequest {
        const result = { method: [this.command], callbackId: this.callbackId || this.command };

        if (this.noneParams) {
            return { ...result, params: [[]] };
        } else if (this.isSingleParams) {
            return { ...result, params: [this.getParam(payload)] };
        } else {
            return { ...result, params: [this.orderParams(payload, defaultValue)] };
        }
    }
}

export abstract class RequestAction extends ApiAction implements Action {
    abstract readonly type: string;

    constructor(public payload: any) { super(); }
}

export abstract class ResponseAction implements Action {
    abstract readonly type: string;

    constructor(public payload: any) { }
}
