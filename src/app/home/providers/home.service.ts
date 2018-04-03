import { selectExchangeResponseState } from './../../store/index.reducer';
import { ExchangeListResponse, ResponseState } from './../../interfaces/response.interface';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ErrorService } from './../../providers/error.service';
import { Store } from '@ngrx/store';
import { ProcessService } from './../../providers/process.service';
import { PublicService } from './../../providers/public.service';
import { Injectable } from '@angular/core';
import { AppState } from '../../store/index.reducer';

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
        return this.error.handleResponseError(
            this.getExchangeListResponseState()
                .filter(res => !!res.error)
                .map(res => res.error)
        );
    }
}