import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import { GetSandboxTokenResponse } from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class SimulationService extends BaseService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================
    /**
     * @ignore
     */
    launchSandboxToken(source: Observable<any>): Subscription {
        return this.process.processSandboxToken(source);
    }

    //  =======================================================Date acquisition=======================================================

    /**
     * @ignore
     */
    private getSandboxTokenResponse(): Observable<GetSandboxTokenResponse> {
        return this.store.pipe(
            select(fromRoot.selectSandboxTokenResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getSandboxToken(): Observable<string> {
        return this.getSandboxTokenResponse().pipe(
            map(res => res.result.token)
        );
    }

    //  =======================================================Shortcut methods=======================================================

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleSandboxTokenError(): Subscription {
        return this.error.handleResponseError(this.getSandboxTokenResponse());
    }
}
