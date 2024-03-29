import { Injectable } from '@angular/core';

import { isNumber } from 'lodash';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
    BacktestResult, ResponseState, RestartRobotResult, ServerBacktestResult
} from '../interfaces/response.interface';
import { getBacktestErrorMessage } from '../store/backtest/backtest.effect';
import { TipService } from './tip.service';

@Injectable()
export class ErrorService {

    constructor(
        private tipService: TipService
    ) { }

    handleResponseError(source: Observable<ResponseState>, params = {}): Subscription {
        return source.pipe(
            filter(data => !!data.error),
            map(data => data.error)
        ).subscribe(data => this.tipService.messageError(data, params));
    }

    handleError(source: Observable<string>, paramsObs = of({})): Subscription {
        return combineLatest(
            source.pipe(
                filter(str => !!str)
            ),
            paramsObs
        ).subscribe(([data, params]) => this.tipService.messageError(data, params));
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

    getBacktestError(result: string | number | ServerBacktestResult<string | BacktestResult>): string {
        return getBacktestErrorMessage(result);
    }
}
