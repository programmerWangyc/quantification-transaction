import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { isNumber, isString } from 'lodash';
import { empty, Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { ServerBacktestCode } from '../../backtest/backtest.config';
import {
    BacktestIOResponse, BacktestResult, ServerBacktestResult, ServerSendBacktestMessage, ServerSendEventType
} from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import { AppState, selectServerMsgSubscribeState } from '../index.reducer';
import {
    UPDATE_STRATEGY_DEPENDANCE_TEMPLATES, UpdateStrategyDependanceTemplatesAction
} from '../strategy/strategy.action';
import * as backtestActions from './backtest.action';

@Injectable()
export class BacktestEffect extends BaseEffect {
    @Effect()
    templates$: Observable<ResponseAction> = this.getResponseAction(backtestActions.GET_TEMPLATES, backtestActions.ResponseActions);

    @Effect()
    backtestIO$: Observable<ResponseAction> = this.getResponseAction(backtestActions.EXECUTE_BACKTEST, backtestActions.ResponseActions, isBacktestFail);

    @Effect()
    backtestResult$: Observable<ResponseAction> = this.getResponseAction(backtestActions.GET_BACKTEST_RESULT, backtestActions.ResponseActions, isBacktestFail);

    @Effect()
    backtestStatus$: Observable<ResponseAction> = this.getResponseAction(backtestActions.GET_BACKTEST_STATUS, backtestActions.ResponseActions, isBacktestFail);

    @Effect()
    deleteBacktest$: Observable<ResponseAction> = this.getResponseAction(backtestActions.DELETE_BACKTEST_TASK, backtestActions.ResponseActions, isBacktestFail);

    @Effect()
    stopBacktest$: Observable<ResponseAction> = this.getResponseAction(backtestActions.STOP_BACKTEST_TASK, backtestActions.ResponseActions, isStopBacktestFail).pipe(
        tap((action: backtestActions.StopBacktestSuccessAction | backtestActions.StopBacktestFailAction) => !isStopBacktestFail(action.payload) && this.tip.messageSuccess('STOP_BACKTEST_SUCCESS'))
    );

    /**
     * 在模板依赖被取消后检查回测中的模板代码是否被用户选中，删除不需要的模板
     */
    @Effect()
    updateCodeContent$: Observable<Action> = this.actions$.ofType(UPDATE_STRATEGY_DEPENDANCE_TEMPLATES).pipe(
        map((action: UpdateStrategyDependanceTemplatesAction) => new backtestActions.CheckBacktestTemplateCodeAction(action.payload))
    );


    @Effect()
    serverSendBacktestEvent$: Observable<ResponseAction> = this.toggleResponsiveServerSendEvent().pipe(
        switchMap(onOff => onOff ? this.ws.messages.pipe(
            filter(msg => msg.event && (msg.event === ServerSendEventType.BACKTEST))) : empty()
        ),
        map(msg => new backtestActions.ReceiveServerSendBacktestEventAction(<ServerSendBacktestMessage<string>>msg.result))
    );

    constructor(
        public actions$: Actions,
        public ws: WebsocketService,
        public tip: TipService,
        public store: Store<AppState>
    ) {
        super(ws, actions$);
    }

    /**
     * 这个流用来在前端模拟出订阅和取消订阅行为，当用户退出具有回测功能的页面或者将任务停止后时会取消订阅，此时不再处理回测消息。
     */
    toggleResponsiveServerSendEvent(): Observable<boolean> {
        return this.store.select(selectServerMsgSubscribeState).pipe(
            map(status => status[ServerSendEventType.BACKTEST])
        );
    }
}

/**
 * @function getBacktestErrorMessage
 *  将backtestIO接口返回的错误信息映射成提示消息。
 */
export function getBacktestErrorMessage(result: string | number | ServerBacktestResult<BacktestResult | string>): string {
    if (result === -1) {
        return 'BACKTEST_SERVER_OFFLINE';
    } else if (result === -2) {
        return 'BACKTEST_STRATEGY_EXPIRED';
    } else {
        const { Code, Result } = <ServerBacktestResult<BacktestResult | string>>result;

        if (Code === ServerBacktestCode.SUCCESS || Code === ServerBacktestCode.ALREADY_EXIST) {
            return null;
        } else {
            return Result === 'Busy' ? 'BACKTEST_SYSTEM_BUSY' : Code + 'Error: ' + Result;
        }
    }
}

/**
 * Whether BacktestIO api execute fail;
 */
function isBacktestFail(response: BacktestIOResponse): boolean {
    return !!response.error || !!getBacktestErrorMessage(isNumber(response.result) ? response.result : JSON.parse(<string>response.result));
}

export function isStopBacktestFail(response: BacktestIOResponse): boolean {
    if (response.error) {
        return true;
    } else {
        const { result } = response;

        const info = isString(result) ? JSON.parse(result) : result;

        return info.Code !== ServerBacktestCode.SUCCESS && info.Code !== ServerBacktestCode.NOT_FOUND;
    }
}
