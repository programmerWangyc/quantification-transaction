import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { isNumber } from 'lodash';
import { Observable } from 'rxjs';
import { filter, map, switchMapTo } from 'rxjs/operators';

import { ServerBacktestCode } from '../../backtest/backtest.config';
import {
    BacktestIOResponse,
    ServerBacktestResult,
    ServerSendBacktestMessage,
    ServerSendEventType,
} from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { ResponseAction } from '../base.action';
import { AppState, selectServerMsgSubscribeState } from '../index.reducer';
import { UPDATE_STRATEGY_DEPENDANCE_TEMPLATES, UpdateStrategyDependanceTemplatesAction } from '../strategy/strategy.action';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as backtestActions from './backtest.action';


@Injectable()
export class BacktestEffect extends BaseEffect {
    @Effect()
    templates$: Observable<ResponseAction> = this.getResponseAction(backtestActions.GET_TEMPLATES, backtestActions.ResponseActions);

    @Effect()
    backtestIO$: Observable<ResponseAction> = this.getResponseAction(backtestActions.EXECUTE_BACKTEST, backtestActions.ResponseActions, isBacktestFail)

    /**
     * @description 在模板依赖被取消后检查回测中的模板代码是否被用户选中，删除不需要的模板
     */
    @Effect()
    updateCodeContent$: Observable<Action> = this.actions$.ofType(UPDATE_STRATEGY_DEPENDANCE_TEMPLATES)
        .pipe(
            map((action: UpdateStrategyDependanceTemplatesAction) => new backtestActions.CheckBacktestTemplateCodeAction(action.payload))
        );


    @Effect()
    serverSendBacktestEvent$: Observable<ResponseAction> = this.toggleResponsiveServerSendEvent()
        .pipe(
            filter(isResponsive => isResponsive),
            switchMapTo(this.ws.messages.pipe(filter(msg => msg.event && (msg.event === ServerSendEventType.BACKTEST)))),
            map(msg => new backtestActions.ReceiveServerSendBacktestEventAction(<ServerSendBacktestMessage>msg.result))
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
     * @description 这个流用来在前端模拟出订阅和取消订阅行为，当用户退出具有回测功能的页面时会取消订阅，此时不再处理回测消息。
     */
    toggleResponsiveServerSendEvent(): Observable<boolean> {
        return this.store.select(selectServerMsgSubscribeState).pipe(
            map(status => status[ServerSendEventType.BACKTEST]));
    }
}

/**
 * @function getBacktestErrorMessage
 * @description 将backtestIO接口返回的错误信息映射成提示消息。
 */
export function getBacktestErrorMessage(result: number | ServerBacktestResult): string {
    if (result === -1) {
        return 'BACKTEST_SERVER_OFFLINE';
    } else if (result === -2) {
        return 'BACKTEST_STRATEGY_EXPIRED';
    } else {
        const { Code, Result } = <ServerBacktestResult>result;

        if (Code === ServerBacktestCode.SUCCESS || Code === ServerBacktestCode.ALREADY_EXIST) {
            return null;
        } else {
            return Result === 'Busy' ? 'BACKTEST_SYSTEM_BUSY' : Code + 'Error: ' + Result;
        }
    }
}

export function isBacktestFail(response: BacktestIOResponse): boolean {
    return !!response.error || !!getBacktestErrorMessage(isNumber(response.result) ? response.result : JSON.parse(response.result));
}
