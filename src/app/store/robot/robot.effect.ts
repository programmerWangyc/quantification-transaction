import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { isString } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { ResponseAction } from '../base.action';
import * as btNodeActions from '../bt-node/bt-node.action';
import * as platformActions from '../platform/platform.action';
import { RestartRobotResponse } from './../../interfaces/response.interface';
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
        this.actions$.ofType(robotActions.GET_ROBOT_DETAIL)
            .zip(
                this.actions$.ofType(robotActions.SUBSCRIBE_ROBOT),
                this.actions$.ofType(robotActions.GET_ROBOT_LOGS),
                this.actions$.ofType(btNodeActions.GET_NODE_LIST),
                this.actions$.ofType(platformActions.GET_PLATFORM_LIST)
            ),
        { ...robotActions.ResponseActions, ...btNodeActions.ResponseActions, ...platformActions.ResponseActions }
    );

    @Effect()
    restartRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.RESTART_ROBOT, robotActions.ResponseActions, isRestartRobotFail);

    @Effect()
    stopRobot$: Observable<ResponseAction> = this.getResponseAction(robotActions.STOP_ROBOT, robotActions.ResponseActions);

    constructor(
        public ws: WebsocketService,
        public actions$: Actions,
    ) {
        super(ws, actions$);
    }
}

function isRestartRobotFail(response: RestartRobotResponse): boolean {
    return !!response.error || response.result < 0 || isString(response.result);
}