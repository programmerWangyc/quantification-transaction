import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of as observableOf, Subscription } from 'rxjs';

import { BaseService } from '../base/base.service';
import { Exchange, GetExchangeListResponse } from '../interfaces/response.interface';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import * as fromRoot from '../store/index.reducer';
import { map, takeWhile } from 'rxjs/operators';
import { isEmpty } from 'lodash';
import { keepAliveFn } from '../interfaces/app.interface';


@Injectable()
export class ExchangeService extends BaseService {

    constructor(
        private process: ProcessService,
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
    ) {
        super();
    }

    launchExchangeList(): Subscription {
        return this.process.processExchangeList(observableOf(null));
    }

    private getExchangeListResponse(): Observable<GetExchangeListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectExchangeListResponse)
        );
    }
    getExchangeList(excludes: string[] = []): Observable<Exchange[]> {
        return this.getExchangeListResponse().pipe(
            map(res => res.result.exchanges),
            map(list => isEmpty(excludes) ? list : list.filter(item => !excludes.includes(item.eid)))
        );
    }

    handleExchangeListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getExchangeListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
