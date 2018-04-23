import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { GetPlatformListResponse, PlatformListResponse } from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { AppState } from './../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';

@Injectable()
export class PlatformService {

    constructor(
        private store: Store<AppState>,
        private error: ErrorService,
        private process: ProcessService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    launchGetPlatformList(data: Observable<any>): Subscription {
        return this.process.processGetPlatformList(data);
    }

    /* =======================================================Date Acquisition======================================================= */

    private getPlatformListResponse(): Observable<GetPlatformListResponse> {
        return this.store.select(fromRoot.selectPlatformListResponse)
            .filter(res => !!res);
    }

    getPlatformList(): Observable<PlatformListResponse> {
        return this.getPlatformListResponse()
            .map(res => res.result);
    }

    /* =======================================================Error Handle======================================================= */

    handlePlatformListError(): Subscription {
        return this.error.handleResponseError(this.getPlatformListResponse());
    }
}
