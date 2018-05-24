import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { RobotDetail, SetRobotWDResponse, Robot } from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { TipService } from './../../providers/tip.service';
import { AppState, selectSetWatchDogResponse, selectSetWatchDogRequest } from './../../store/index.reducer';
import { SetRobotWDRequest } from '../../interfaces/request.interface';

export enum SetWatchDogTip {
    CLOSE_ROBOT_MONITOR_CONFIRM,
    OPEN_ROBOT_MONITOR_CONFIRM
}

@Injectable()
export class WatchDogService {

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tip: TipService,
    ) { }

    /* =======================================================Api request======================================================= */

    launchSetRobotWatchDog(robot: Observable<RobotDetail | Robot>): Subscription {
        return this.process.processSetRobotWatchDog(robot.mergeMap(robot => {
            const watchDogStatus = robot.wd > 0 ? 0 : 1;

            return this.tip.confirmOperateTip(ConfirmComponent, { message: SetWatchDogTip[watchDogStatus], needTranslate: true })
                .filter(sure => sure)
                .mapTo({ robotId: robot.id, watchDogStatus });
        }));
    }

    /* =======================================================Date Acquisition======================================================= */

    private getSetWatchDogResponse(): Observable<SetRobotWDResponse> {
        return this.store.select(selectSetWatchDogResponse)
            .filter(v => !!v);
    }

    getLatestRobotWatchDogState(): Observable<SetRobotWDRequest> {
        return this.getSetWatchDogResponse()
            .filter(res => res.result)
            .switchMapTo(this.store.select(selectSetWatchDogRequest));
    }

    /* =======================================================Local state change======================================================= */

    /* =======================================================Error handle======================================================= */

    handleSetWatchDogError(): Subscription {
        return this.error.handleResponseError(this.getSetWatchDogResponse());
    }
}