import 'rxjs/add/operator/mapTo';

import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { WsRequest } from '../interfaces/request.interface';
import { ResponseBody, ResponseItem } from '../interfaces/response.interface';
import { ResponseUnit } from './../interfaces/response.interface';
import { WebsocketService } from './../providers/websocket.service';
import { RequestAction, ResponseAction } from './base.action';
import { ApiActions, failTail, successTail } from './index.action';

export declare function resultPredicate(data: ResponseUnit<any>): boolean;

export interface isFail<T> {
    (result: ResponseUnit<T>): boolean;
}

/**
 * @function isFail 
 * @param data ResponseUnit<any> 
 * @description Predicate the response is an error or not;
 */
export const isFail: isFail<any> = (data: ResponseUnit<any>) => !!data.error;

@Injectable()
export class BaseEffect {
    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) { }

    /**
     * 
     * @param data ResponseBody 
     * @param actionModule Collection of response actions;
     * @param resultFail Predicate whether the response is success.
     * @description Used to split the response data to corresponding response actions.
     */
    private getSplitAction(data: ResponseBody, actionModule: Object, resultFail = isFail): Observable<ResponseAction> {
        return Observable.from(<ResponseUnit<ResponseItem>[]>data.result || [])
            .zip(Observable.from(data.callbackId.split('-')), (result, action) => ({ ...result, action }))
            // .do(res => console.log(`Action-${res.action} get response: `, res.result))
            .map(res => new actionModule[res.action + (resultFail(res) ? failTail : successTail)](res));
    }

    /**
     * @method getResponseAction 
     * @param actionName Request action name;
     * @param actionModule Collection of response actions;
     * @param resultFail Predicate whether the response is success.
     * @description If a request calls only one interface, use this method.
     */
    protected getResponseAction(actionName: string, actionModule: object, resultFail = isFail): Observable<ResponseAction> {
        return this.actions$.ofType(actionName)
            .filter((action: ApiActions) => action.allowSeparate())
            .switchMap((action: ApiActions) => this.ws
                .send(action.getParams(action.payload))
                .takeUntil(this.actions$.ofType(actionName))
                .mergeMap(body => this.getSplitAction(body, actionModule, resultFail))
                .catch(error => Observable.of(error))
            );
    }

    /**
     * @method getMultiResponseAction
     * @param source Collection of request actions.
     * @param actionModule Collection of response actions;
     * @description If a request calls multiple interfaces, use this method.
     */
    protected getMultiResponseActions(source: Observable<Action[]>, actionModule: object): Observable<ResponseAction> {
        return source.map(actions => actions.map((action: RequestAction) => action.getParams(action.payload)))
            .switchMap((data: WsRequest[]) => this.ws
                .send(this.mergeParams(data))
                .takeUntil(source.mapTo(true))
                .mergeMap(body => this.getSplitAction(body, actionModule))
                .catch(error => Observable.of(error))
            );
    }

    /**
     * @method mergeParams
     * @description Merge multiple requests into one request.
     */
    private mergeParams(source: WsRequest[]): WsRequest {
        const result = { method: [], params: [] };

        for (let i = 0, len = source.length; i < len; i++) {
            result.method = result.method.concat(source[i].method);
            result.params = result.params.concat(source[i].params);
        }

        return result;
    }
}

