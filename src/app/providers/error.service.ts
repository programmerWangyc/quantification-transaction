import { Injectable } from '@angular/core';
import { isNumber } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { getBacktestErrorMessage } from '../store/backtest/backtest.effect';
import { ResponseState, RestartRobotResult, ServerBacktestResult } from './../interfaces/response.interface';
import { TipService } from './tip.service';


@Injectable()
export class ErrorService {

    constructor(private tipService: TipService) { }

    handleResponseError(source: Observable<ResponseState>): Subscription {
        return source.pipe(
            filter(data => !!data.error),
            map(data => data.error), )
            .subscribe(data => this.tipService.showTip(data));
    }

    handleError(source: Observable<string>): Subscription {
        return source.pipe(
            filter(str => !!str))
            .subscribe(data => this.tipService.showTip(data));
    }

    getRestartRobotError(status: number | string): string {
        if (isNumber(status)) {
            return status < 0 ? RestartRobotResult[Math.abs(status)] : '';
        } else {
            return status;
        }
    }

    getStopRobotError(result: any): string {
        return result ? '' : 'STOP_ROBOT_ERROR';
    }

    getDeleteRobotError(result: number): string {
        return Math.abs(result) === 1 ? 'DELETE_ROBOT_ERROR' : '';
    }

    getBacktestError(result: number | ServerBacktestResult): string {
        return getBacktestErrorMessage(result);
    }
}
