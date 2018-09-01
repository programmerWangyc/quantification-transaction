import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { merge, Observable, Subscription } from 'rxjs';
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
export class SubaccountService extends BaseService {

    private readonly confirmLabel = 'OPERATE_SUBACCOUNT_CONFIRM';

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
    launchAccount(params: Observable<fromReq.GetAccountRequest>): Subscription {
        return this.process.processGetAccount(params);
    }

    /**
     * @ignore
     */
    launchShadowMember(params: Observable<fromReq.GetShadowMemberRequest>): Subscription {
        return this.process.processGetShadowMember(params);
    }

    /**
     * @ignore
     */
    launchAddShadowMember(params: Observable<fromReq.SaveShadowMemberRequest>): Subscription {
        return this.process.processSaveShadowMember(params);
    }

    /**
     * @ignore
     */
    launchUpdateShadowMember(params: Observable<fromReq.SaveShadowMemberRequest>): Subscription {
        return this.process.processUpdateShadowMember(params);
    }

    /**
     * @ignore
     */
    launchDeleteShadowMember(params: Observable<fromReq.DeleteShadowMemberRequest>): Subscription {
        return this.process.processDeleteShadowMember(params.pipe(
            switchMap(({ memberId }) => this.tipService.guardRiskOperate(this.confirmLabel, { operate: this.unwrap(this.translate.get('DELETE')) }).pipe(
                mapTo({ memberId })
            ))
        ));
    }

    /**
     * @ignore
     */
    launchLockShadowMember(params: Observable<fromReq.LockShadowMemberRequest>): Subscription {
        return this.process.processLockShadowMember(params.pipe(
            switchMap(({ memberId, status }) => this.tipService.guardRiskOperate(this.confirmLabel, { operate: this.unwrap(this.translate.get(status ? 'UNLOCK' : 'LOCK')) }).pipe(
                mapTo({ memberId, status: Number(!status) })
            ))
        ));
    }

    //  =======================================================Data acquisition=======================================================

    /**
     * @ignore
     */
    private getAccountResponse(): Observable<fromRes.GetAccountResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectGetAccountResponse)
        );
    }

    /**
     * Account response result
     */
    getAccounts(): Observable<fromRes.AccountResponse> {
        return this.getAccountResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getShadowMemberResponse(): Observable<fromRes.GetShadowMemberResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectGetShadowMemberResponse)
        );
    }

    /**
     * Shadow members;
     */
    getShadowMemberAccounts(): Observable<fromRes.ShadowMember[]> {
        return this.getShadowMemberResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * Available robots;
     */
    getAvailableRobots(): Observable<fromRes.ShadowRobot[]> {
        return this.getShadowMemberResponse().pipe(
            map(res => res.result.robots)
        );
    }

    /**
     * @ignore
     */
    private getAddAndUpdateShadowMemberResponse(): Observable<fromRes.SaveShadowMemberResponse> {
        return merge(
            this.store.pipe(
                select(fromRoot.selectAddShadowMemberResponse)
            ),
            this.store.pipe(
                select(fromRoot.selectUpdateShadowMemberResponse)
            )
        );
    }

    /**
     * @ignore
     */
    private getDeleteShadowMemberResponse(): Observable<fromRes.DeleteShadowMemberResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectDeleteShadowMemberResponse)
        );
    }

    /**
     * @ignore
     */
    private getLockShadowMemberResponse(): Observable<fromRes.LockShadowMemberResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectLockShadowMemberResponse)
        );
    }

    //  =======================================================UI state =======================================================

    /**
     * @ignore
     */
    isLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectAccountUIState),
            map(state => state.loading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    //  =======================================================Local state change=======================================================

    //  =======================================================shortcut method=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleAccountError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getAccountResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleGetShadowMemberError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handlesSaveShadowMemberError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getAddAndUpdateShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteShadowMemberError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getDeleteShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleLockShadowMemberError(keepAlive: keepAliveFn): Subscription {
        return this.errorService.handleResponseError(this.getLockShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
