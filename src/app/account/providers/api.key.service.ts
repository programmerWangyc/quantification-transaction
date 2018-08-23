import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subscription } from 'rxjs';
import { switchMap, takeWhile, map } from 'rxjs/operators/';

import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import { AccountOperateBase } from './subaccount.service';

@Injectable()
export class ApiKeyService extends AccountOperateBase {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private errorService: ErrorService,
        public tipService: TipService,
        public translate: TranslateService,
    ) {
        super(tipService, translate, 'OPERATE_API_KEY_CONFIRM');
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
            switchMap(({ id, status }) => this.confirm({ id, status }, status ? 'UNLOCK' : 'LOCK'))
        ));
    }

    /**
     * @ignore
     */
    launchDeleteApiKey(params: Observable<fromReq.DeletePlatformRequest>): Subscription {
        return this.process.processDeleteApiKey(params.pipe(
            switchMap(({ id }) => this.confirm({ id }, 'DELETE'))
        ));
    }

    //  =======================================================Data acquisition=======================================================

    /**
     * @ignore
     */
    private getApiKeyListResponse(): Observable<fromRes.GetApiKeyListResponse> {
        return this.store.pipe(
            select(fromRoot.selectGetApiKeyListResponse),
            this.filterTruth()
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
    private getCreateApiKeyResposne(): Observable<fromRes.CreateApiKeyResponse> {
        return this.store.pipe(
            select(fromRoot.selectCreateApiKeResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    private getLockApiKeyResponse(): Observable<fromRes.LockApiKeyResponse> {
        return this.store.pipe(
            select(fromRoot.selectLockApiKeyResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    private getDeleteApikeyResponse(): Observable<fromRes.DeleteApiKeyResponse> {
        return this.store.pipe(
            select(fromRoot.selectDeleteApiKeyResponse),
            this.filterTruth()
        );
    }

    //  =======================================================Shortcut methods =======================================================

    //  =======================================================UI state =======================================================

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleApiKeyListError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getApiKeyListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleCreateApiKeyError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getCreateApiKeyResposne().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleLockApiKeyError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getLockApiKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteApiKeyError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getDeleteApikeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
