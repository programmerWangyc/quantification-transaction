import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as fromRoot from '../../store/index.reducer';
import { TipService } from '../../providers/tip.service';
import { keepAliveFn } from '../../interfaces/app.interface';

@Injectable()
export class FactService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private tipService: TipService,
    ) {
        super();
    }

    launchPublicRobotList(source: Observable<fromReq.GetPublicRobotListRequest>): Subscription {
        return this.process.processPublicRobotList(source);
    }

    private getPublicRobotListResponse(): Observable<fromRes.GetPublicRobotListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectPublicRobotListResponse)
        );
    }

    getPublicRobotList(): Observable<fromRes.PublicRobot[]> {
        return this.getPublicRobotListResponse().pipe(
            map(res => res.result.robots)
        );
    }

    isLoading(type?: string): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectRobotUiState),
            map(state => type ? state[type] : state.loading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    handlePublicRobotListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getPublicRobotListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
