import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { isString } from 'lodash';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

import {
    CommandRobotResponse, DeleteRobotResponse, RestartRobotResponse, ServerSendEventType, ServerSendRobotMessage, SaveRobotResponse
} from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { WebsocketService } from '../../providers/websocket.service';
import { ServerSendRobotEventType } from '../../robot/robot.config';
import { ResponseAction } from '../base.action';
import { BaseEffect } from '../base.effect';
import { AppState, selectRobotRequestParameters } from '../index.reducer';
import * as robotActions from './robot.action';

@Injectable()
export class RobotEffect extends BaseEffect {

    @Effect()
    robotList$: Observable<ResponseAction> = this.getResponseAction(robotActions.GET_ROBOT_LIST, robotActions.ResponseActions);

    @Effect()
    publishRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.PUBLIC_ROBOT, robotActions.ResponseActions);

    @Effect()
    robotDetail$: Observable<ResponseAction> = this.getResponseAction(robotActions.GET_ROBOT_DETAIL, robotActions.ResponseActions);

    @Effect()
    subscribeRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.SUBSCRIBE_ROBOT, robotActions.ResponseActions);

    @Effect()
    robotLog$: Observable<ResponseAction> = this.getResponseAction(robotActions.GET_ROBOT_LOGS, robotActions.ResponseActions);

    @Effect()
    restartRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.RESTART_ROBOT, robotActions.ResponseActions, isRestartRobotFail);

    @Effect()
    stopRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.STOP_ROBOT, robotActions.ResponseActions);

    @Effect()
    modifyRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.MODIFY_ROBOT, robotActions.ResponseActions).pipe(
        tap(action => !(<robotActions.ModifyRobotFailAction>action).payload.error && this.tip.messageSuccess('ROBOT_CONFIG_UPDATE_SUCCESS'))
    );

    @Effect()
    commandRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.COMMAND_ROBOT, robotActions.ResponseActions, isCommandRobotFail).pipe(
        tap(this.tip.messageByResponse('COMMAND_ROBOT_SUCCESS_TIP', 'COMMAND_ROBOT_FAIL_TIP'))
    );


    @Effect()
    deleteRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.DELETE_ROBOT, robotActions.ResponseActions, isDeleteRobotFail);

    @Effect()
    saveRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.SAVE_ROBOT, robotActions.ResponseActions, isSaveRobotFail).pipe(
        tap(this.tip.messageByResponse('CREATE_ROBOT_SUCCESS', 'CREATE_ROBOT_FAIL', res => res > 0))
    );

    @Effect()
    serverSendEvent$: Observable<ResponseAction> = this.toggleResponsiveServerSendEvent().pipe(
        switchMap(isOpen => this.ws.messages.pipe(
            filter(msg => {
                const condition = msg.event && (msg.event === ServerSendEventType.ROBOT);

                return isOpen ? condition : condition && !!((<ServerSendRobotMessage>msg.result).flags & ServerSendRobotEventType.UPDATE_STATUS);
            }),
            map(msg => new robotActions.ReceiveServerSendRobotEventAction(<ServerSendRobotMessage>msg.result)),
        ))
    );

    @Effect()
    runPlugin$: Observable<ResponseAction> = this.getResponseAction(robotActions.RUN_PLUGIN, robotActions.ResponseActions);

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
        public tip: TipService,
        public store: Store<AppState>,
    ) {
        super(ws, actions$);
    }

    toggleResponsiveServerSendEvent(): Observable<boolean> {
        return this.store.select(selectRobotRequestParameters).pipe(
            filter(request => !!request),
            map(res => res.subscribeRobot && res.subscribeRobot.id !== 0),
            distinctUntilChanged()
        );
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

export function isSaveRobotFail(response: SaveRobotResponse): boolean {
    return !!response.error || response.result < 0;
}
