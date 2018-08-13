import { Action } from '@ngrx/store';

import { WsRequest } from '../interfaces/request.interface';

/**
 * @class ApiAction
 *  Base class of the interface-related actions. All the classes that are related to the request action, include the request-action
 * fail-action success-action, must be derive from this base class.
 */
export abstract class ApiAction {

    /**
     * @property isSingleParams Whether this request has only one parameter;
     *  For single-parameter and multi-parameter requests, different methods need to be used to generate request parameters.
     */
    abstract isSingleParams: boolean;

    /**
     * @property command
     *  Commands that communicate with server to indicate the type of data that this request wishes to obtain.
     */
    abstract command: string;

    /**
     * @property order Order of parameters, generally is an enum type.
     *  Used to specify how each parameter should be sent to the server in what order.
     */
    abstract order: ArrayLike<string>;

    /**
     * @property noneParams Whether this request has parameter.
     *  For with parameter and with out parameter requests, different methods need to be used to generate request parameters.
     */
    abstract noneParams: boolean;

    /**
     * @property callbackId
     *  It will be passed to server with request, and received within response, so we can find the response correspond to witch request.
     */
    callbackId?: any;

    /**
     * @method oderParams
     *  If the request has multiple parameters, use this method to generate parameters that communicate with the server.
     */
    private orderParams(payload: any, defaultValue): any[] {
        return new Array(this.order.length).fill(defaultValue).map((_, index) => {
            const result = payload[this.order[index]];

            return result === undefined ? defaultValue : result;
        });
    }

    /**
     * @method getParam
     * @param payload Source data of the request parameters.
     *  If the request has one parameter only, use this method to generate parameters that communicate with the server.
     */
    private getParam(payload: any): any[] {
        return Object.keys(payload).map(key => payload[key]);
    }

    /**
     * @method getParams
     * @param payload Source data of the request parameters.
     * @param defaultValue The default value when no parameters are provided in multiple request case.
     *  Used to convert the parameters in the request action into a format that can communicate with the server.
     */
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

/**
 * These two classes below have none instance, just used to indicate the type.
 */
/**
 * @class RequestAction
 *  Base class of all request actions.
 */
export abstract class RequestAction extends ApiAction implements Action {
    abstract readonly type: string;

    constructor(public payload: any) { super(); }
}

/**
 * @class ResponseAction
 *  Base class of all response actions.
 */
export abstract class ResponseAction implements Action {
    abstract readonly type: string;

    constructor(public payload: any) { }
}
