import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import { from as observableFrom, Observable, of as observableOf, zip } from 'rxjs';
import { catchError, filter, map, mapTo, mergeMap, switchMap, takeUntil } from 'rxjs/operators';

import { WsRequest } from '../interfaces/request.interface';
import { ResponseBody, ResponseItem, ResponseUnit } from '../interfaces/response.interface';
import { WebsocketService } from '../providers/websocket.service';
import { RequestAction, ResponseAction } from './base.action';
import { ApiActions, failTail, successTail } from './index.action';

export declare function resultPredicate(data: ResponseUnit<any>): boolean;

export type isFail<T> = (result: ResponseUnit<T>) => boolean;

/**
 * Predicate the response is an error or not;
 * @param data ResponseUnit<any>
 */
export const isFail: isFail<any> = (data: ResponseUnit<any>) => !!data.error;

@Injectable()
export class BaseEffect {
    readonly callbackIdFlag = '-';

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) { }

    /**
     * Used to split the response data to corresponding response actions.
     * @param data ResponseBody
     * @param actionModule Collection of response actions;
     * @param resultFail Predicate whether the response is success.
     */
    private getSplitAction(data: ResponseBody, actionModule: Object, resultFail = isFail): Observable<ResponseAction> {
        return zip(
            observableFrom(<ResponseUnit<ResponseItem>[]>data.result || []),
            observableFrom(data.callbackId.split(this.callbackIdFlag))
        )
            .pipe(
                map(([result, action]) => ({ ...result, action })),
                // tap(res => console.log(`Action-${res.action} get response: `, res.result)),
                map(res => new actionModule[res.action + (resultFail(res) ? failTail : successTail)](res))
            );
    }

    /**
     * If a request calls only one interface, use this method.
     * @param actionName Request action name;
     * @param actionModule Collection of response actions;
     * @param resultFail Predicate whether the response is success.
     */
    protected getResponseAction(actionName: string, actionModule: object, resultFail = isFail): Observable<ResponseAction> {
        return this.actions$.ofType(actionName).pipe(
            filter((action: ApiActions) => action.allowSeparate()),
            switchMap((action: ApiActions) => this.ws
                .send(action.getParams(action.payload)).pipe(
                    takeUntil(this.actions$.ofType(actionName)),
                    mergeMap(body => this.getSplitAction(body, actionModule, resultFail)),
                    catchError(error => observableOf(error))
                )
            )
        );
    }

    /**
     * If a request calls multiple interfaces, use this method.
     * @param source Collection of request actions.
     * @param actionModule Collection of response actions;
     */
    protected getMultiResponseActions(source: Observable<Action[]>, actionModule: object): Observable<ResponseAction> {
        return source.pipe(
            map(actions => actions.map((action: RequestAction) => action.getParams(action.payload))),
            switchMap((data: WsRequest[]) => this.ws
                .send(this.mergeParams(data)).pipe(
                    takeUntil(source.pipe(mapTo(true))),
                    mergeMap(body => this.getSplitAction(body, actionModule)),
                    catchError(error => observableOf(error)))
            )
        );
    }

    /**
     * Merge multiple requests into one request.
     */
    private mergeParams(source: WsRequest[]): WsRequest {
        const result = { method: [], params: [], callbackId: '' };

        for (let i = 0, len = source.length; i < len; i++) {
            result.method = result.method.concat(source[i].method);
            result.params = result.params.concat(source[i].params);
        }

        result.callbackId = source.map(item => item.callbackId).join(this.callbackIdFlag);

        return result;
    }
}

