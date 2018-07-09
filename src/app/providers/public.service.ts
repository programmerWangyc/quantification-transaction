import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { isString } from 'lodash';
import { combineLatest, merge, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, tap } from 'rxjs/operators';

import { LocalStorageKey } from '../app.config';
import { BaseService } from '../base/base.service';
import { SettingTypes } from '../interfaces/request.interface';
import {
    AppState,
    selectEditorConfig,
    selectFooterState,
    selectLanguage,
    selectPublicResponse,
    selectReferrer,
    selectServerMsgSubscribeState,
    selectSettings,
} from '../store/index.reducer';
import { EditorConfig, Referrer } from './../interfaces/app.interface';
import { PublicResponse, ResponseState } from './../interfaces/response.interface';
import { selectSettingsResponse } from './../store/index.reducer';
import {
    SetLanguageAction,
    SetReferrerAction,
    ToggleFooterAction,
    ToggleSubscribeServerSendMessageTypeAction,
    UpdateFavoriteEditorConfigAction,
} from './../store/public/public.action';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';


@Injectable()
export class PublicService extends BaseService {

    refUser$$: Subject<string> = new Subject();

    constructor(
        private store: Store<AppState>,
        private process: ProcessService,
        private error: ErrorService,
    ) {
        super();
        this.checkReferrerUser();
    }

    //  =======================================================Server Request=======================================================

    launchGetSettings(type: string | Observable<string>, single = true): Subscription {
        return this.process.processSettings(isString(type) ? observableOf({ type }) : type.pipe(map(type => ({ type }))), single);
    }

    //  =======================================================Date acquisition=======================================================

    getSettingsResponse(): Observable<ResponseState> {
        return this.store.select(selectSettingsResponse)
            .pipe(
                this.filterTruth()
            );
    }

    getSettingState(settingType: string): Observable<boolean> {
        return this.store.select(selectSettings)
            .pipe(
                map(res => !!res[settingType])
            );
    }

    getSetting(settingType: string): Observable<any> {
        return this.store.select(selectSettings)
            .pipe(
                tap(settings => !settings[settingType] && this.launchGetSettings(SettingTypes[settingType])),
                filter(settings => !!settings[settingType]),
                map(settings => settings[settingType])
            );
    }

    // response body information
    getPublicResponse(): Observable<PublicResponse> {
        return this.store.select(selectPublicResponse);
    }

    private getSecurityPublicResponse(): Observable<PublicResponse> {
        return this.getPublicResponse()
            .pipe(
                this.filterTruth()
            );
    }

    getToken(): Observable<string> {
        return this.getPublicResponse()
            .pipe(
                map(res => res ? res.token : localStorage.getItem(LocalStorageKey.token))
            );
    }

    isSubAccount(): Observable<boolean> {
        return this.getToken()
            .pipe(
                map(token => typeof token === 'string' && token.indexOf("1|") === 0)
            );
    }

    getCurrentUser(): Observable<string> {
        return this.getPublicResponse()
            .pipe(
                map(res => res ? res.username : localStorage.getItem(LocalStorageKey.username))
            );
    }

    isAdmin(): Observable<boolean> {
        return this.getSecurityPublicResponse()
            .pipe(
                map(res => res.is_admin)
            );
    }

    isLogin(): Observable<boolean> {
        return this.getToken()
            .pipe(
                map(token => !!token && token.length > 0)
            );
    }

    getError(): Observable<string> {
        return this.getPublicResponse()
            .pipe(
                filter(this.isTruth), map(res => res.error)
            );
    }

    getBalance(): Observable<number> {
        return this.getSecurityPublicResponse()
            .pipe(
                map(res => res.balance)
            );
    }

    getConsumed(): Observable<number> {
        return this.getSecurityPublicResponse()
            .pipe(
                map(res => res.consumed)
            );
    }

    // ui state
    getLanguage(): Observable<string> {
        return this.store.select(selectLanguage);
    }

    getFooterState(): Observable<boolean> {
        return this.store.select(selectFooterState);
    }

    // editor config
    getFavoriteEditorConfig(): Observable<EditorConfig> {
        return this.store.select(selectEditorConfig)
            .pipe(
                map(res => res ? res : JSON.parse(localStorage.getItem(LocalStorageKey.editorConfig))),
                filter(this.isTruth)
            );
    }

    // server message subscribe state
    getServerMsgSubscribeState(msgType: string): Observable<boolean> {
        return this.store.pipe(
            select(selectServerMsgSubscribeState),
            map(res => res[msgType])
        );
    }

    //  =======================================================Config operate=======================================================

    updateInformation(): Subscription {
        return this.updateToken().add(this.updateCurrentUser());
    }

    saveReferrer(): Subscription {
        return combineLatest(
            this.refUser$$,
            this.checkReferrerUrl()
                .pipe(
                    filter(url => url.length > 0 && url.indexOf(`${location.protocol}//${location.hostname}`) !== 0),
                    startWith('')
                )
        )
            .pipe(
                map(([refUrl, refUser]) => ({ refUrl, refUser }))
            )
            .subscribe(referrer => this.store.dispatch(new SetReferrerAction(referrer)));
    }

    getReferrer(): Observable<Referrer> {
        return merge(
            this.store.pipe(
                select(selectReferrer),
                filter(referrer => !!referrer)
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

        return observableOf(referrer);
    }

    private checkReferrerUser() {
        const arr = location.href.split('refer_');

        const user = arr.length === 2 ? arr[1] : '';

        this.refUser$$.next(user);
    }

    private updateToken(): Subscription {
        return this.getToken()
            .pipe(
                distinctUntilChanged()
            )
            .subscribe(token => localStorage.setItem(LocalStorageKey.token, token || ''));
    }

    private updateCurrentUser(): Subscription {
        return this.getCurrentUser()
            .pipe(
                distinctUntilChanged()
            )
            .subscribe(username => localStorage.setItem(LocalStorageKey.username, username || ''));
    }

    //  =======================================================Local state change=======================================================

    updateEditorConfig(config: EditorConfig): void {
        this.store.dispatch(new UpdateFavoriteEditorConfigAction(config));
    }

    updateServerMsgSubscribeState(message: string, status: boolean): void {
        this.store.dispatch(new ToggleSubscribeServerSendMessageTypeAction({ message, status }));
    }

    //  =======================================================Error Handle=======================================================

    handleSettingsError(): Subscription {
        return this.error.handleResponseError(this.getSettingsResponse());
    }

    handlePublicError(): Subscription {
        return this.error.handleError(this.getError());
    }

}
