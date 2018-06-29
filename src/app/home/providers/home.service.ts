import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of as observableOf, Subscription } from 'rxjs';

import { AppState } from '../../store/index.reducer';
import { ResponseState } from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { selectExchangeResponseState } from './../../store/index.reducer';
import { BaseService } from '../../base/base.service';


@Injectable()
export class HomeService extends BaseService {

    constructor(
        private process: ProcessService,
        private store: Store<AppState>,
        private error: ErrorService,
    ) {
        super();
    }

    /* =======================================================Server request======================================================= */

    launchExchangeList(): Subscription {
        return this.process.processExchangeList(observableOf(null));
    }

    /* =======================================================Date Acquisition======================================================= */

    getExchangeListResponseState(): Observable<ResponseState> {
        return this.store.select(selectExchangeResponseState)
            .pipe(
                this.filterTruth()
            );
    }

    /* =======================================================Error handle======================================================= */

    handleExchangeListError(): Subscription {
        return this.error.handleResponseError(this.getExchangeListResponseState());
    }
}
