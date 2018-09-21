import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import { from as observableFrom, Observable, of as observableOf, zip } from 'rxjs';
import { catchError, map, mapTo, mergeMap, switchMap, takeUntil } from 'rxjs/operators';

import { WsRequest } from '../interfaces/request.interface';
import { ResponseBody, ResponseItem, ResponseUnit } from '../interfaces/response.interface';
import { WebsocketService } from '../providers/websocket.service';
import { RequestAction, ResponseAction } from './base.action';
import { ApiActions, failTail, successTail } from './index.action';

export declare function resultPredicate(data: ResponseUnit<any>): boolean;

export type isFail<T> = (result: ResponseUnit<T>) => boolean;


export const isFail: isFail<any> = (data: ResponseUnit<any>) => !!data.error;

@Injectable()
export class BaseEffect {
    readonly callbackIdFlag = '-';

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) { }




    private getSplitAction(data: ResponseBody, actionModule: Object, resultFail = isFail): Observable<ResponseAction> {
        return zip(
            observableFrom(<ResponseUnit<ResponseItem>[]>data.result || []),
            observableFrom(data.callbackId.split(this.callbackIdFlag))
        ).pipe(
            map(([result, action]) => ({ ...result, action })),
            // tap(res => console.log(`Action-${res.action} get response: `, res.result)),
            map(res => new actionModule[res.action + (resultFail(res) ? failTail : successTail)](res))
        );
    }


    protected getResponseAction(actionName: string, actionModule: object, resultFail = isFail): Observable<ResponseAction> {
        return this.actions$.ofType(actionName).pipe(
            switchMap((action: ApiActions) => this.ws
                .send(action.getParams(action.payload)).pipe(
                    takeUntil(this.actions$.ofType(actionName)),
                    mergeMap(body => this.getSplitAction(body, actionModule, resultFail)),
                    catchError(error => observableOf(error))
                )
            )
        );
    }


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

