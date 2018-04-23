import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { GetNodeListResponse, NodeListResponse } from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { AppState } from './../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';

@Injectable()
export class BtNodeService {

    constructor(
        private store: Store<AppState>,
        private error: ErrorService,
        private process: ProcessService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    launchGetNodeList(data: Observable<any>): Subscription {
        return this.process.processGetNodeList(data);
    }

    /* =======================================================Date Acquisition======================================================= */

    private getNodeListResponse(): Observable<GetNodeListResponse> {
        return this.store.select(fromRoot.selectBtNodeListResponse)
            .filter(res => !!res);
    }

    getNodeList(): Observable<NodeListResponse> {
        return this.getNodeListResponse()
            .map(res => res.result);
    }

    /* =======================================================Error Handle======================================================= */

    handleNodeListError(): Subscription {
        return this.error.handleResponseError(this.getNodeListResponse());
    }
}
