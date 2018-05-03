import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ResponseState, RestartRobotResult } from './../interfaces/response.interface';
import { TipService } from './tip.service';

@Injectable()
export class ErrorService {

    constructor(private tipService: TipService) { }

    handleResponseError(source: Observable<ResponseState>): Subscription {
        return source
            .filter(data => !!data.error)
            .map(data => data.error)
            .subscribe(data => this.tipService.showTip(data));
    }

    handleError(source: Observable<string>): Subscription {
        return source
            .filter(str => !!str)
            .subscribe(data => this.tipService.showTip(data));
    }

    getRestartRobotError(status: number | string): string {
        if (typeof status === 'number') {
            return RestartRobotResult[Math.abs(status)];
        } else {
            return status;
        }
    }

    getStopRobotError(result: any): string {
        return result ? '' : 'STOP_ROBOT_ERROR';
    }
}
