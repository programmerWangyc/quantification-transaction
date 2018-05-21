import 'rxjs/add/observable/empty';
import { TipService } from './../../providers/tip.service';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { isString } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { ResponseAction } from '../base.action';
import * as btNodeActions from '../bt-node/bt-node.action';
import * as platformActions from '../platform/platform.action';
import { RestartRobotResponse, CommandRobotResponse, ServerSendEventType, ServerSendRobotMessage } from './../../interfaces/response.interface';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as robotActions from './robot.action';
import { ModifyRobotFailAction, CommandRobotSuccessAction, CommandRobotFailAction, ReceiveServerSendRobotEventAction } from './robot.action';
import { Action, Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AppState, selectRobotRequestParameters } from '../index.reducer';
import { RobotService } from '../../btcommon/providers/robot.service';

@Injectable()
export class RobotEffect extends BaseEffect {

    @Effect()
    robotList$: Observable<ResponseAction> = this.getResponseAction(robotActions.GET_ROBOT_LIST, robotActions.ResponseActions);

    @Effect()
    publishRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.PUBLIC_ROBOT, robotActions.ResponseActions);

    @Effect()
    robotDetail$: Observable<ResponseAction> = this.getMultiResponseActions(
        this.actions$.ofType(robotActions.GET_ROBOT_DETAIL).zip(...this.getOtherObs()),
        { ...robotActions.ResponseActions, ...btNodeActions.ResponseActions, ...platformActions.ResponseActions }
    );

    @Effect()
    subscribeRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.SUBSCRIBE_ROBOT, robotActions.ResponseActions);

    @Effect()
    robotLog$: Observable<ResponseAction> = this.getResponseAction(robotActions.GET_ROBOT_LOGS, robotActions.ResponseActions);

    @Effect()
    restartRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.RESTART_ROBOT, robotActions.ResponseActions, isRestartRobotFail);

    @Effect()
    stopRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.STOP_ROBOT, robotActions.ResponseActions);

    @Effect()
    modifyRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.MODIFY_ROBOT, robotActions.ResponseActions)
        .do(action => !(<ModifyRobotFailAction>action).payload.error && this.tip.showTip('ROBOT_CONFIG_UPDATE_SUCCESS'))

    @Effect()
    commandRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.COMMAND_ROBOT, robotActions.ResponseActions, isCommandRobotFail)
        .do(action => {
            const message = (<CommandRobotSuccessAction | CommandRobotFailAction>action).payload.result ? 'COMMAND_ROBOT_SUCCESS_TIP' : 'COMMAND_ROBOT_FAIL_TIP';

            this.tip.showTip(message);
        });

    @Effect()
    serverSendEvent$: Observable<ResponseAction> = this.toggleResponsiveServerSendEvent()
        .switchMap(state => state ? this.ws.messages.filter(msg => msg.event && msg.event === ServerSendEventType.ROBOT)
            .map(msg => new ReceiveServerSendRobotEventAction(<ServerSendRobotMessage>msg.result)) : Observable.empty()
        );

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
        public tip: TipService,
        public store: Store<AppState>,
    ) {
        super(ws, actions$);
    }

    getOtherObs(): Observable<Action>[] {
        return [
            this.actions$.ofType(robotActions.SUBSCRIBE_ROBOT).filter((action: robotActions.SubscribeRobotRequestAction) => action.payload.id !== 0),
            this.actions$.ofType(robotActions.GET_ROBOT_LOGS).filter((action: robotActions.GetRobotLogsRequestAction) => !action.allowSeparateRequest),
            this.actions$.ofType(btNodeActions.GET_NODE_LIST),
            this.actions$.ofType(platformActions.GET_PLATFORM_LIST)
        ];
    }

    /**
     * @description 这个流用来在前端模拟出订阅和取消订阅行为，当用户退出机器人详情页面时（目前只有这个页面需要订阅机器人）会取消订阅，此时将不再处理网络推送中有关机器人的相关信息。
     */
    toggleResponsiveServerSendEvent(): Observable<boolean> {
        return this.store.select(selectRobotRequestParameters)
            .filter(v => !!v)
            .map(res => res.subscribeRobot && res.subscribeRobot.id !== 0)
            .distinctUntilChanged()
    }
}

function isRestartRobotFail(response: RestartRobotResponse): boolean {
    return !!response.error || response.result < 0 || isString(response.result);
}

function isCommandRobotFail(response: CommandRobotResponse): boolean {
    return !response.result || !!response.error;
}
