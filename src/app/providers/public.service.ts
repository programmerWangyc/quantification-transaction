import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { isString } from 'lodash';
import { combineLatest, merge, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, take, takeWhile, tap } from 'rxjs/operators';

import { LocalStorageKey } from '../app.config';
import { BaseService } from '../base/base.service';
import { EditorConfig, keepAliveFn, Referrer } from '../interfaces/app.interface';
import { SettingTypes, VerifyKeyRequest } from '../interfaces/request.interface';
import {
    AccountSummary, Broker, ChangeAlertThresholdSettingResponse, GetAccountSummaryResponse, LogoutResponse,
    PublicResponse, ResponseState, VerifyKeyResponse
} from '../interfaces/response.interface';
import { ClearLoginInfoAction } from '../store/auth/login.action';
import * as fromRoot from '../store/index.reducer';
import {
    ResetLogoutResponseAction, SetLanguageAction, SetReferrerAction, ToggleFooterAction,
    ToggleSubscribeServerSendMessageTypeAction, UpdateFavoriteEditorConfigAction
} from '../store/public/public.action';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';

@Injectable()
export class PublicService extends BaseService {

    refUser$$: Subject<string> = new Subject();

    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
    ) {
        super();
        this.checkReferrerUser();
    }


    launchGetSettings(typeSource: string | Observable<string>): Subscription {
        return this.process.processSettings(
            isString(typeSource) ? observableOf({ type: typeSource })
                : typeSource.pipe(
                    map(type => ({ type }))
                )
        );
    }

    launchLogout(source: Observable<any>): Subscription {
        this.clearUserInfo();

        return this.process.processLogout(source);
    }

    launchChangeAlertThresholdSetting(source: Observable<number>): Subscription {
        return this.process.processChangeAlertThresholdSetting(source.pipe(
            map(amount => ({ amount, type: SettingTypes.alertThreshold }))
        ));
    }

    launchVerifyKey(params: Observable<VerifyKeyRequest>): Subscription {
        return this.process.processVerifyKey(params);
    }

    launchAccountSummary(params: Observable<any>): Subscription {
        return this.process.processGetAccountSummary(params);
    }

    getSettingsResponse(): Observable<ResponseState> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectSettingsResponse),
        );
    }

    getSetting(settingType: string): Observable<string> {
        return this.store.pipe(
            select(fromRoot.selectSettings),
            tap(settings => !settings[settingType] && this.launchGetSettings(SettingTypes[settingType] || settingType)),
            filter(settings => !!settings[settingType]),
            map(settings => settings[settingType])
        );
    }

    getBrokers(): Observable<Broker[]> {
        return this.getSetting(SettingTypes.brokers).pipe(
            map(source => JSON.parse(source) as Broker[])
        );
    }

    private getPublicResponse(): Observable<PublicResponse> {
        return this.store.pipe(
            select(fromRoot.selectPublicResponse)
        );
    }

    getToken(): Observable<string> {
        return this.getPublicResponse().pipe(
            map(res => res ? res.token : localStorage.getItem(LocalStorageKey.token)),
            distinctUntilChanged()
        );
    }

    isSubAccount(): Observable<boolean> {
        return this.getToken().pipe(
            map(token => typeof token === 'string' && token.indexOf('1|') === 0)
        );
    }

    getCurrentUser(): Observable<string> {
        return this.getPublicResponse().pipe(
            map(res => res ? res.username : localStorage.getItem(LocalStorageKey.username)),
            distinctUntilChanged()
        );
    }

    isAdmin(): Observable<boolean> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.is_admin),
            distinctUntilChanged()
        );
    }

    isLogin(): Observable<boolean> {
        return this.getToken().pipe(
            map(token => !!token && token.length > 0)
        );
    }

    getError(): Observable<string> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.error)
        );
    }

    getBalance(): Observable<number> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.balance),
            distinctUntilChanged()
        );
    }

    getConsumed(): Observable<number> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.consumed),
            distinctUntilChanged()
        );
    }

    getNotify(): Observable<number> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.notify),
            distinctUntilChanged()
        );
    }

    private getLogoutResponse(): Observable<LogoutResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectLogoutResponse)
        );
    }

    isLogoutSuccess(): Observable<boolean> {
        return this.getLogoutResponse().pipe(
            map(res => res.result)
        );
    }

    private getChangeAlertThresholdSettingResponse(): Observable<ChangeAlertThresholdSettingResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectChangeAlertThresholdSettingResponse)
        );
    }

    private getVerifyKeyResponse(): Observable<VerifyKeyResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectVerifyKeyResponse)
        );
    }

    isVerifyKeySuccess(keepAlive: keepAliveFn): Observable<boolean> {
        return this.getVerifyKeyResponse().pipe(
            map(res => res.result),
            takeWhile(keepAlive)
        );
    }

    getLanguage(): Observable<string> {
        return this.store.pipe(
            select(fromRoot.selectLanguage)
        );
    }

    getFooterState(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectFooterState)
        );
    }

    getFavoriteEditorConfig(): Observable<EditorConfig> {
        return this.store.pipe(
            select(fromRoot.selectEditorConfig),
            map(res => res ? res : JSON.parse(localStorage.getItem(LocalStorageKey.editorConfig))),
            this.filterTruth()
        );
    }

    getServerMsgSubscribeState(msgType: string): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectServerMsgSubscribeState),
            map(res => res[msgType])
        );
    }

    getAccountSummaryResponse(): Observable<GetAccountSummaryResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectAccountSummaryResponse)
        );
    }

    getAccountSummary(): Observable<AccountSummary> {
        return this.getAccountSummaryResponse().pipe(
            map(res => res.result)
        );
    }

    updateInformation(): Subscription {
        return this.updateToken().add(this.updateCurrentUser());
    }

    saveReferrer(): Subscription {
        return combineLatest(
            this.refUser$$,
            this.checkReferrerUrl().pipe(
                filter(url => url.length > 0 && url.indexOf(`${location.protocol}//${location.hostname}`) !== 0),
                startWith('')
            )
        ).pipe(
            map(([refUrl, refUser]) => ({ refUrl, refUser }))
        )
            .subscribe(referrer => this.store.dispatch(new SetReferrerAction(referrer)));
    }

    getReferrer(): Observable<Referrer> {
        return merge(
            this.store.pipe(
                this.selectTruth(fromRoot.selectReferrer),
            ),
            this.getReferrerFromLocalStorage()
        );
    }

    updateLanguage(language: Observable<string>): Subscription {
        return language.subscribe(lang => this.store.dispatch(new SetLanguageAction(lang)));
    }

    toggleFooter(): void {
        this.store.dispatch(new ToggleFooterAction());
    }

    private getReferrerFromLocalStorage(): Observable<Referrer> {
        const refUrl = localStorage.getItem(LocalStorageKey.refUrl) || '';

        const refUser = localStorage.getItem(LocalStorageKey.refUser) || '';

        return observableOf({ refUrl, refUser });
    }

    private checkReferrerUrl(): Observable<string> {
        let referrer = '';

        try {
            referrer = window.top.document.referrer;
        } catch (e) {
            if (window.parent) {
                try {
                    referrer = window.parent.document.referrer;
                } catch (e2) {
                    referrer = '';
                }
            }
        }

        if (referrer === '') {
            referrer = document.referrer;
        }

        return observableOf(referrer);
    }

    private checkReferrerUser() {
        const arr = location.href.split('refer_');

        const user = arr.length === 2 ? arr[1] : '';

        this.refUser$$.next(user);
    }

    private updateToken(): Subscription {
        return this.getToken().pipe(
            distinctUntilChanged()
        ).subscribe(token => localStorage.setItem(LocalStorageKey.token, token || ''));
    }

    private updateCurrentUser(): Subscription {
        return this.getCurrentUser().pipe(
            distinctUntilChanged()
        ).subscribe(username => localStorage.setItem(LocalStorageKey.username, username || ''));
    }

    updateEditorConfig(config: EditorConfig): void {
        this.store.dispatch(new UpdateFavoriteEditorConfigAction(config));
    }

    updateServerMsgSubscribeState(message: string, status: boolean): void {
        this.store.dispatch(new ToggleSubscribeServerSendMessageTypeAction({ message, status }));
    }

    private clearUserInfo(): void {
        this.isLogoutSuccess().pipe(
            take(1)
        ).subscribe(isLogoutSuccess => {
            if (isLogoutSuccess) {
                this.store.dispatch(new ClearLoginInfoAction());

                this.store.dispatch(new ResetLogoutResponseAction());
            } else {
                // nothing to do;
            }
        });
    }

    handleSettingsError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getSettingsResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handlePublicError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleError(this.getError().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleLogoutError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getLogoutResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
    handleChangeAlertThresholdError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getChangeAlertThresholdSettingResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleVerifyKeyError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getVerifyKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleAccountSummaryError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getAccountSummaryResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
