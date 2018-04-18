import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppState, selectRobotListData, selectRobotListResState } from '../../store/index.reducer';
import { GetRobotListRequest } from './../../interfaces/request.interface';
import { ResponseState, Robot, RobotListResponse } from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';

@Injectable()
export class RobotService {

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    launchRobotList(data: Observable<GetRobotListRequest>): Subscription {
        return this.process.processRobotList(data);
    }


    /* =======================================================Date Acquisition======================================================= */

    getRobotListResponse(): Observable<RobotListResponse> {
        return this.store.select(selectRobotListData)
            .filter(response => !!response)
    }

    getRobotTotal(): Observable<number> {
        return this.getRobotListResponse()
            .map(res => res.all);
    }

    getRobotConcurrence(): Observable<number> {
        return this.getRobotListResponse()
            .map(res => res.concurrent);
    }

    getRobots(): Observable<Robot[]> {
        return this.getRobotListResponse()
            .map(res => res.robots);
    }

    getRobotListResState(): Observable<ResponseState> {
        return this.store.select(selectRobotListResState)
            .filter(res => !!res);
    }

    /* =======================================================Error Handle======================================================= */

    handleRobotListError(): Subscription {
        return this.error.handleResponseError(
            this.getRobotListResState()
                .filter(data => !!data.error)
                .map(data => data.error)
        )
    }
}
