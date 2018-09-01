import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subscription } from 'rxjs';
import { map, mapTo, switchMap, takeWhile } from 'rxjs/operators/';

import { BaseService } from '../../base/base.service';
import { keepAliveFn } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class ApiKeyService extends BaseService {

    private readonly confirmLabel = 'OPERATE_API_KEY_CONFIRM';

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private errorService: ErrorService,
        private tipService: TipService,
        private translate: TranslateService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchGetApiKeyList(params: Observable<fromReq.GetApiKeyListRequest>): Subscription {
        return this.process.processGetApiKeyList(params);
    }

    /**
     * @ignore
     */
    launchCreateApiKey(params: Observable<fromReq.CreateApiKeyRequest>): Subscription {
        return this.process.processCreateApiKey(params);
    }

    /**
     * @ignore
     */
    launchLockApiKey(params: Observable<fromReq.LockApiKeyRequest>): Subscription {
        return this.process.processLockApiKey(params.pipe(
            switchMap(({ id, status }) => this.tipService.guardRiskOperate(this.confirmLabel, { operate: this.unwrap(this.translate.get(status ? 'UNLOCK' : 'LOCK')) }).pipe(
                mapTo({ id, status })
            ))
        ));
    }

    /**
     * @ignore
     */
    launchDeleteApiKey(params: Observable<fromReq.DeletePlatformRequest>): Subscription {
        return this.process.processDeleteApiKey(params.pipe(
            switchMap(({ id }) => this.tipService.guardRiskOperate(this.confirmLabel, { operate: this.unwrap(this.translate.get('DELETE')) }).pipe(
                mapTo({ id })
            ))
        ));
    }

    //  =======================================================Data acquisition=======================================================

    /**
     * @ignore
     */
    private getApiKeyListResponse(): Observable<fromRes.GetApiKeyListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectGetApiKeyListResponse)
        );
    }

    /**
     * @ignore
     */
    getApiKeyListResult(): Observable<fromRes.ApiKey[]> {
        return this.getApiKeyListResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getCreateApiKeyResponse(): Observable<fromRes.CreateApiKeyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectCreateApiKeResponse)
        );
    }

    /**
     * @ignore
     */
    private getLockApiKeyResponse(): Observable<fromRes.LockApiKeyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectLockApiKeyResponse)
        );
    }

    /**
     * @ignore
     */
    private getDeleteApikeyResponse(): Observable<fromRes.DeleteApiKeyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectDeleteApiKeyResponse)
        );
    }

    //  =======================================================Shortcut methods =======================================================

    //  =======================================================UI state =======================================================

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleApiKeyListError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getApiKeyListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleCreateApiKeyError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getCreateApiKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleLockApiKeyError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getLockApiKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteApiKeyError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getDeleteApikeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
