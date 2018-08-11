import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of as observableOf, Subscription } from 'rxjs';

import { BaseService } from '../base/base.service';
import { Exchange, GetExchangeListResponse } from '../interfaces/response.interface';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import * as fromRoot from '../store/index.reducer';
import { map } from 'rxjs/operators';
import { isEmpty } from 'lodash';


@Injectable()
export class ExchangeService extends BaseService {

    constructor(
        private process: ProcessService,
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
    ) {
        super();
    }

    //  =======================================================Server request=======================================================

    /**
     * @ignore
     */
    launchExchangeList(): Subscription {
        return this.process.processExchangeList(observableOf(null));
    }

    //  =======================================================Date Acquisition=======================================================

    /**
     * exchange list 的响应应状态；
     */
    private getExchangeListResponse(): Observable<GetExchangeListResponse> {
        return this.store.select(fromRoot.selectExchangeListResponse).pipe(
            this.filterTruth()
        );
    }

    /**
     * 获取所有交易所
     * @param excludes 需要排除的交易所 eid 列表;
     */
    getExchangeList(excludes: string[] = []): Observable<Exchange[]> {
        return this.getExchangeListResponse().pipe(
            map(res => res.result.exchanges),
            map(list => isEmpty(excludes) ? list : list.filter(item => !excludes.includes(item.eid)))
        );
    }

    //  =======================================================Local state change=======================================================


    //  =======================================================Error handle=======================================================

    /**
     * @ignore
     */
    handleExchangeListError(): Subscription {
        return this.error.handleResponseError(this.getExchangeListResponse());
    }
}
