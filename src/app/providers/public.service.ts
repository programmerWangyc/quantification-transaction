import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/startWith';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import {
    AppState,
    selectError,
    selectFooterState,
    selectIsAdmin,
    selectLanguage,
    selectReferrer,
    selectSettings,
    selectToken,
    selectUsernameFromPublic,
} from '../store/index.reducer';
import { Settings, settings } from './../../../request.interface';
import { Referrer } from './../interfaces/constant.interface';
import { LocalStorageKey } from './../interfaces/constant.interface';
import { ResponseState } from './../interfaces/response.interface';
import { selectSettingsResponse } from './../store/index.reducer';
import { SetLanguageAction, SetReferrerAction, ToggleFooterAction } from './../store/public/public.action';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';

@Injectable()
export class PublicService {

    refUser$$: Subject<string> = new Subject();

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
    ) {
        this.checkReferrerUser();
    }

    /* =======================================================Server Request======================================================= */

    launchGetSettings(type: string, single = true): Subscription {
        return this.process.processSettings(Observable.of({ type }), single);
    }

    /* =======================================================Date acquisition======================================================= */

    getSettingsResponse(): Observable<ResponseState> {
        return this.store.select(selectSettingsResponse)
            .filter(res => !!res);
    }

    // agreement
    getAgreement(): Observable<string> {
        return this.store.select(selectSettings)
            .do(settings => (!settings || !settings.agreement) && this.launchGetSettings(Settings.agreement))
            .filter(settings => !!settings && !!settings.agreement)
            .map(settings => settings.agreement)
    }

    getAgreementState(): Observable<boolean> {
        return this.store.select(selectSettings)
            .map(res => !!res && !!res.agreement);
    }

    // response body information
    getToken(): Observable<string> {
        return this.store.select(selectToken);
    }

    isSubAccount(): Observable<boolean> {
        return this.getToken()
            .map(token => typeof token === 'string' && token.indexOf("1|") === 0);
    }

    getCurrentUser(): Observable<string> {
        return this.store.select(selectUsernameFromPublic);
    }

    isAdmin(): Observable<boolean> {
        return this.store.select(selectIsAdmin);
    }

    isLogin(): Observable<boolean> {
        return this.getToken().map(token => !!token && token.length > 0);
    }

    getError(): Observable<string> {
        return this.store.select(selectError);
    }

    // ui state
    getLanguage(): Observable<string> {
        return this.store.select(selectLanguage);
    }

    getFooterState(): Observable<boolean> {
        return this.store.select(selectFooterState);
    }

    /* =======================================================Config operate======================================================= */

    updateInformation(): Subscription {
        return this.updateToken().add(this.updateCurrentUser());
    }

    saveReferrer(): Subscription {
        return this.refUser$$.combineLatest(
            this.checkReferrerUrl()
                .filter(url => url.length > 0 && url.indexOf(`${location.protocol}//${location.hostname}`) !== 0)
                .startWith(''),
            (refUrl, refUser) => ({ refUrl, refUser })
        )
            .subscribe(referrer => this.store.dispatch(new SetReferrerAction(referrer)));
    }

    getReferrer(): Observable<Referrer> {
        return this.store.select(selectReferrer)
            .filter(referrer => !!referrer)
            .merge(this.getReferrerFromLocalStorage());
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

        return Observable.of({ refUrl, refUser });
    }

    private checkReferrerUrl(): Observable<string> {
        let referrer = '';

        try {
            referrer = window.top.document.referrer;
        }
        catch (e) {
            if (window.parent) {
                try {
                    referrer = window.parent.document.referrer;
                }
                catch (e2) {
                    referrer = '';
                }
            }
        }

        if (referrer === '') {
            referrer = document.referrer;
        }

        return Observable.of(referrer);
    }

    private checkReferrerUser() {
        const arr = location.href.split('refer_');

        const user = arr.length === 2 ? arr[1] : '';

        this.refUser$$.next(user);
    }

    private updateToken(): Subscription {
        return this.getToken()
            .distinctUntilChanged()
            .subscribe(token => localStorage.setItem(LocalStorageKey.token, token || ''));
    }

    private updateCurrentUser(): Subscription {
        return this.getCurrentUser()
            .distinctUntilChanged()
            .subscribe(username => localStorage.setItem(LocalStorageKey.username, username || ''));
    }

    /* =======================================================Error Handle======================================================= */

    handleSettingsError(): Subscription {
        return this.error.handleResponseError(this.getSettingsResponse());
    }

    handlePublicError(): Subscription {
        return this.error.handleError(this.getError());
    }

}
