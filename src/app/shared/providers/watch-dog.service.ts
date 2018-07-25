import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { filter, mapTo, mergeMap, switchMapTo } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { SetWDRequest } from '../../interfaces/request.interface';
import { BtNode, Robot, RobotDetail, SetWDResponse } from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import { AppState, selectSetWatchDogRequest, selectSetWatchDogResponse } from '../../store/index.reducer';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';

export enum SetWatchDogTip {
    CLOSE_ROBOT_MONITOR_CONFIRM,
    OPEN_ROBOT_MONITOR_CONFIRM,
}

@Injectable()
export class WatchDogService extends BaseService {

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tip: TipService,
    ) {
        super();
    }

    //  =======================================================Api request=======================================================

    /**
     * Set or cancel watch dog on target;
     * @param targetObs Robot or agent;
     */
    launchSetWatchDog(targetObs: Observable<RobotDetail | Robot | BtNode>): Subscription {
        return this.process.processSetWatchDog(
            targetObs.pipe(
                mergeMap(target => {
                    const watchDogStatus = target.wd > 0 ? 0 : 1;

                    return this.tip.confirmOperateTip(
                        ConfirmComponent,
                        { message: SetWatchDogTip[watchDogStatus], needTranslate: true }
                    ).pipe(
                        this.filterTruth(),
                        mapTo({ id: target.id, watchDogStatus })
                    );
                })
            )
        );
    }

    //  =======================================================Date Acquisition=======================================================

    /**
     * @ignore
     */
    private getSetWatchDogResponse(): Observable<SetWDResponse> {
        return this.store.select(selectSetWatchDogResponse).pipe(
            this.filterTruth()
        );
    }

    /**
     * 获取机器狗的最新状态, 也就是设置响应成功后发出的请求状态；
     */
    getLatestWatchDogState(): Observable<SetWDRequest> {
        return this.getSetWatchDogResponse().pipe(
            filter(res => res.result),
            switchMapTo(this.store.select(selectSetWatchDogRequest))
        );
    }

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handle=======================================================

    /**
     * @ignore
     */
    handleSetWatchDogError(): Subscription {
        return this.error.handleResponseError(this.getSetWatchDogResponse());
    }
}
