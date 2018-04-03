import { Actions } from '@ngrx/effects';
import { WebsocketService } from './../providers/websocket.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { WsRequest } from '../interfaces/request.interface';
import { ResponseBody } from '../interfaces/response.interface';
import { ResponseUnit } from './../interfaces/response.interface';
import { ApiActions, failTail, successTail } from './index.action';
import { Action } from '@ngrx/store';
import { RequestAction, ResponseAction} from './base.action';
import 'rxjs/add/operator/mapTo';

export declare function resultPredicate(data: ResponseUnit<any>): boolean;

export interface isFail<T> {
    (result: ResponseUnit<T>): boolean;
}

export const isFail: isFail<any> = (data: ResponseUnit<any>) => !!data.error;

@Injectable()
export class BaseEffect {
    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) { }

    protected getSplitAction(data: ResponseBody, actionModule: Object, resultFail = isFail): Observable<ResponseAction> {
        return Observable.from(data.result || [])
            .zip(Observable.from(data.callbackId.split('-')), (result, action) => ({ ...result, action }))
            .do(v => console.log(v))
            .map(res => new actionModule[res.action + (resultFail(res) ? failTail : successTail)](res));
    }

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

    protected getMultiResponseActions(source: Observable<Action[]>, actionModule: object): Observable<ResponseAction> {
        return source.map(actions => actions.map((action: RequestAction) => action.getParams(action.payload)))
            .switchMap((data: WsRequest[]) => this.ws
                .send(this.mergeParams(data))
                .takeUntil(source.mapTo(true))
                .mergeMap(body => this.getSplitAction(body, actionModule))
                .catch(error => Observable.of(error))
            );
    }

    private mergeParams(source: WsRequest[]): WsRequest {
        const result = { method: [], params: [] };

        for (let i = 0, len = source.length; i < len; i++) {
            result.method = result.method.concat(source[i].method);
            result.params = result.params.concat(source[i].params);
        }

        return result;
    }
}

