import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppState } from '../../store/index.reducer';
import { ResponseState } from './../../interfaces/response.interface';
import { ErrorService } from './../../providers/error.service';
import { ProcessService } from './../../providers/process.service';
import { selectExchangeResponseState } from './../../store/index.reducer';

@Injectable()
export class HomeService {

    constructor(
        private process: ProcessService,
        private store: Store<AppState>,
        private error: ErrorService,
    ) { }

    /* =======================================================Server request======================================================= */

    launchExchangeList(): Subscription {
        return this.process.processExchangeList(Observable.of(null));
    }

    /* =======================================================Date Acquisition======================================================= */

    getExchangeListResponseState(): Observable<ResponseState> {
        return this.store.select(selectExchangeResponseState)
            .filter(v => !!v);
    }

    /* =======================================================Error handle======================================================= */

    handleExchangeListError(): Subscription {
        return this.error.handleResponseError(this.getExchangeListResponseState());
    }
}