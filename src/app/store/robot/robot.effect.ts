import 'rxjs/add/observable/empty';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { isString } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { ServerSendRobotEventType } from '../../interfaces/constant.interface';
import { ResponseAction } from '../base.action';
import * as btNodeActions from '../bt-node/bt-node.action';
import { AppState, selectRobotRequestParameters } from '../index.reducer';
import * as platformActions from '../platform/platform.action';
import {
    CommandRobotResponse,
    DeleteRobotResponse,
    RestartRobotResponse,
    ServerSendEventType,
    ServerSendRobotMessage,
} from './../../interfaces/response.interface';
import { TipService } from './../../providers/tip.service';
import { WebsocketService } from './../../providers/websocket.service';
import { BaseEffect } from './../base.effect';
import * as robotActions from './robot.action';

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
        .do(action => !(<robotActions.ModifyRobotFailAction>action).payload.error && this.tip.showTip('ROBOT_CONFIG_UPDATE_SUCCESS'))

    @Effect()
    commandRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.COMMAND_ROBOT, robotActions.ResponseActions, isCommandRobotFail)
        .do(action => {
            const message = (<robotActions.CommandRobotSuccessAction | robotActions.CommandRobotFailAction>action).payload.result ? 'COMMAND_ROBOT_SUCCESS_TIP' : 'COMMAND_ROBOT_FAIL_TIP';

            this.tip.showTip(message);
        });

    @Effect()
    deleteRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.DELETE_ROBOT, robotActions.ResponseActions, isDeleteRobotFail)

    @Effect()
    saveRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.SAVE_ROBOT, robotActions.ResponseActions)
        .do(action => {
            const message = (<robotActions.SaveRobotSuccessAction | robotActions.SaveRobotFailAction>action).payload.result ? 'CREATE_ROBOT_SUCCESS' : 'CREATE_ROBOT_FAIL';

            this.tip.showTip(message);
        })

    @Effect()
    serverSendEvent$: Observable<ResponseAction> = this.toggleResponsiveServerSendEvent()
        .switchMap(state => this.ws.messages.filter(msg => {
            const condition = msg.event && (msg.event === ServerSendEventType.ROBOT);

            return state ? condition : condition && !!((<ServerSendRobotMessage>msg.result).flags & ServerSendRobotEventType.UPDATE_STATUS)
        })
            .map(msg => new robotActions.ReceiveServerSendRobotEventAction(<ServerSendRobotMessage>msg.result))
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
     * @description 这个流用来在前端模拟出订阅和取消订阅行为，当用户退出机器人详情页面时（目前只有这个页面需要订阅机器人）会取消订阅，此时除了机器人的状态变更外，其它的相关信息将不再被订阅。
     *
     */
    toggleResponsiveServerSendEvent(): Observable<boolean> {
        return this.store.select(selectRobotRequestParameters)
            .filter(v => !!v)
            .map(res => res.subscribeRobot && res.subscribeRobot.id !== 0)
            .distinctUntilChanged()
    }
}

export function isRestartRobotFail(response: RestartRobotResponse): boolean {
    return !!response.error || response.result < 0 || isString(response.result);
}

export function isCommandRobotFail(response: CommandRobotResponse): boolean {
    return !response.result || !!response.error;
}

export function isDeleteRobotFail(response: DeleteRobotResponse): boolean {
    return !!response.error || Math.abs(response.result) === 1;
}
