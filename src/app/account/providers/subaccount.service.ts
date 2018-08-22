import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription, merge } from 'rxjs';
import { mapTo, switchMap, takeWhile, map } from 'rxjs/operators/';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';
import { ConfirmComponent } from '../../tool/confirm/confirm.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SubaccountService extends BaseService {
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
            switchMap(({ memberId }) => this.tipService.confirmOperateTip(
                ConfirmComponent,
                { message: this.getTipMsg('DELETE'), needTranslate: false },
            ).pipe(
                this.filterTruth(),
                mapTo({ memberId })
            ))
        ));
    }

    /**
     * @ignore
     */
    launchLockShadowMember(params: Observable<fromReq.LockShadowMemberRequest>): Subscription {
        return this.process.processLockShadowMember(params.pipe(
            switchMap(({ memberId, status }) => this.tipService.confirmOperateTip(
                ConfirmComponent,
                { message: this.getTipMsg(status ? 'UNLOCK' : 'LOCK'), needTranslate: false },
            ).pipe(
                this.filterTruth(),
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
            select(fromRoot.selectGetAccountResponse),
            this.filterTruth()
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
            select(fromRoot.selectGetShadowMemberResponse),
            this.filterTruth()
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
            select(fromRoot.selectDeleteShadowMemberResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    private getLockShadowMemberResponse(): Observable<fromRes.LockShadowMemberResponse> {
        return this.store.pipe(
            select(fromRoot.selectLockShadowMemberResponse),
            this.filterTruth()
        );
    }

    //  =======================================================UI state =======================================================

    /**
     * @ignore
     */
    isLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectAccountUIState),
            map(state => state.loading)
        );
    }

    //  =======================================================Local state change=======================================================

    //  =======================================================shortcut method=======================================================

    /**
     * Combine action and operate label;
     * @param operate Operate action;
     */
    private getTipMsg(operate: string): string {
        return this.unwrap(this.translate.get('OPERATE_SUBACCOUNT_CONFIRM', { operate: this.unwrap(this.translate.get(operate)) }));
    }

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleAccountError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getAccountResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleGetShadowMemberError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handlesSaveShadowMemberError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getAddAndUpdateShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteShadowMemberError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getDeleteShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleLockShadowMemberError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getLockShadowMemberResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
