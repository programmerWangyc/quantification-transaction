import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { WsRequest } from '../interfaces/request.interface';
import { ResponseAction, ResponseBody } from '../interfaces/response.interface';
import { ResponseUnit } from './../interfaces/response.interface';
import { ApiActions, failTail, successTail } from './index.action';

export declare function resultPredicate(data: ResponseUnit<any>): boolean;

export interface isFail<T> {
    (result: ResponseUnit<T>): boolean;
}

export const isFail: isFail<any> = (data: ResponseUnit<any>) => !!data.error;

@Injectable()
export class BaseEffect {
    constructor() { }

    getSplitAction(data: ResponseBody, actionModule: Object, predicationFn: isFail<any> = isFail): Observable<ResponseAction> {
        return Observable.from(data.result || [])
            .zip(Observable.from(data.callbackId.split('-')), (result, action) => ({ ...result, action }))
            .map(res => new actionModule[res.action + (predicationFn(res) ? failTail : successTail)](res))
    }

    getParams(action: ApiActions): WsRequest {
        return { method: [action.command], params: [action.orderParams(action.payload)] }
    }
}

