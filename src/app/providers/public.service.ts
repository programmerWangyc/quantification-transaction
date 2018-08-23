import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { isString } from 'lodash';
import { combineLatest, merge, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, take, takeWhile, tap } from 'rxjs/operators';

import { LocalStorageKey } from '../app.config';
import { BaseService } from '../base/base.service';
import { EditorConfig, Referrer } from '../interfaces/app.interface';
import { SettingTypes } from '../interfaces/request.interface';
import { Broker, LogoutResponse, PublicResponse, ResponseState, ChangeAlertThresholdSettingResponse } from '../interfaces/response.interface';
import { ClearLoginInfoAction } from '../store/auth/login.action';
import {
    AppState, selectEditorConfig, selectFooterState, selectLanguage, selectLogoutResponse, selectPublicResponse,
    selectReferrer, selectServerMsgSubscribeState, selectSettings, selectSettingsResponse, selectChangeAlertThresholdSettingResponse
} from '../store/index.reducer';
import {
    SetLanguageAction, SetReferrerAction, ToggleFooterAction, ToggleSubscribeServerSendMessageTypeAction,
    UpdateFavoriteEditorConfigAction,
    ResetLogoutResponseAction
} from '../store/public/public.action';
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

    /**
     * 请求设置信息
     * @param typeSource 需要获取的设置种类
     * @param single 是否允许此请求单独发送
     */
    launchGetSettings(typeSource: string | Observable<string>): Subscription {
        return this.process.processSettings(
            isString(typeSource) ? observableOf({ type: typeSource })
                : typeSource.pipe(
                    map(type => ({ type }))
                )
        );
    }

    /**
     * 不需要任何参数，只要发出退出登录的信号就行；
     * 退出成功后清理信息
     */
    launchLogout(source: Observable<any>): Subscription {
        this.clearUserInfo();

        return this.process.processLogout(source);
    }

    /**
     * @ignore
     */
    launchChangeAlertThresholdSetting(source: Observable<number>): Subscription {
        return this.process.processChangeAlertThresholdSetting(source.pipe(
            map(amount => ({ amount, type: SettingTypes.alertThreshold }))
        ));
    }

    //  =======================================================Date acquisition=======================================================

    /**
     * 获取设置的服务器响应
     */
    getSettingsResponse(): Observable<ResponseState> {
        return this.store.select(selectSettingsResponse).pipe(
            this.filterTruth()
        );
    }

    /**
     * 是否有指定的设置
     */
    hasSetting(settingType: string): Observable<boolean> {
        return this.store.select(selectSettings).pipe(
            map(res => !!res[settingType])
        );
    }

    /**
     * Get specific setting. If specific setting is not exist, request from server.
     * @param settingType Setting type;
     * @return Setting; JSON type string, maybe need to pares then use;
     */
    getSetting(settingType: string): Observable<string> {
        return this.store.select(selectSettings).pipe(
            tap(settings => !settings[settingType] && this.launchGetSettings(SettingTypes[settingType] || settingType)),
            filter(settings => !!settings[settingType]),
            map(settings => settings[settingType])
        );
    }

    /**
     * Get brokers
     */
    getBrokers(): Observable<Broker[]> {
        return this.getSetting(SettingTypes.brokers).pipe(
            map(source => JSON.parse(source) as Broker[])
        );
    }

    /**
     * 服务器响应的公共信息。此部分信息在所有的接口都会返回。
     */
    private getPublicResponse(): Observable<PublicResponse> {
        return this.store.select(selectPublicResponse);
    }

    /**
     * 获取token
     */
    getToken(): Observable<string> {
        return this.getPublicResponse().pipe(
            map(res => res ? res.token : localStorage.getItem(LocalStorageKey.token)),
            distinctUntilChanged()
        );
    }

    /**
     * @ignore
     */
    isSubAccount(): Observable<boolean> {
        return this.getToken().pipe(
            map(token => typeof token === 'string' && token.indexOf('1|') === 0)
        );
    }

    /**
     * @ignore
     */
    getCurrentUser(): Observable<string> {
        return this.getPublicResponse().pipe(
            map(res => res ? res.username : localStorage.getItem(LocalStorageKey.username)),
            distinctUntilChanged()
        );
    }

    /**
     * @ignore
     */
    isAdmin(): Observable<boolean> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.is_admin),
            distinctUntilChanged()
        );
    }

    /**
     * 用户是否已经登录
     */
    isLogin(): Observable<boolean> {
        return this.getToken().pipe(
            map(token => !!token && token.length > 0),
        );
    }

    getError(): Observable<string> {
        return this.getPublicResponse().pipe(
            filter(this.isTruth),
            map(res => res.error)
        );
    }

    /**
     * @ignore
     */
    getBalance(): Observable<number> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.balance),
            distinctUntilChanged()
        );
    }

    /**
     * @ignore
     */
    getConsumed(): Observable<number> {
        return this.getPublicResponse().pipe(
            this.filterTruth(),
            map(res => res.consumed),
            distinctUntilChanged()
        );
    }

    /**
     * @ignore
     */
    private getLogoutResponse(): Observable<LogoutResponse> {
        return this.store.pipe(
            select(selectLogoutResponse),
            this.filterTruth()
        );
    }

    /**
     * 服务器退出登录响应
     */
    isLogoutSuccess(): Observable<boolean> {
        return this.getLogoutResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getChangeAlertThresholdSettingResponse(): Observable<ChangeAlertThresholdSettingResponse> {
        return this.store.pipe(
            select(selectChangeAlertThresholdSettingResponse),
            this.filterTruth()
        );
    }

    // ====================================================================ui state============================================

    /**
     * @ignore
     */
    getLanguage(): Observable<string> {
        return this.store.select(selectLanguage);
    }

    /**
     * @ignore
     */
    getFooterState(): Observable<boolean> {
        return this.store.select(selectFooterState);
    }

    /**
     * editor config
     */
    getFavoriteEditorConfig(): Observable<EditorConfig> {
        return this.store.select(selectEditorConfig).pipe(
            map(res => res ? res : JSON.parse(localStorage.getItem(LocalStorageKey.editorConfig))),
            filter(this.isTruth)
        );
    }

    /**
     * server message subscribe state
     */
    getServerMsgSubscribeState(msgType: string): Observable<boolean> {
        return this.store.pipe(
            select(selectServerMsgSubscribeState),
            map(res => res[msgType])
        );
    }

    //  =======================================================Config operate=======================================================

    /**
     * 应用的整个生命周期内都会监听，每个响应回来时都会检查公共信息。
     */
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

    /**
     * @ignore
     */
    private updateToken(): Subscription {
        return this.getToken().pipe(
            distinctUntilChanged()
        ).subscribe(token => localStorage.setItem(LocalStorageKey.token, token || ''));
    }

    /**
     * @ignore
     */
    private updateCurrentUser(): Subscription {
        return this.getCurrentUser().pipe(
            distinctUntilChanged()
        ).subscribe(username => localStorage.setItem(LocalStorageKey.username, username || ''));
    }

    //  =======================================================Local state change=======================================================

    updateEditorConfig(config: EditorConfig): void {
        this.store.dispatch(new UpdateFavoriteEditorConfigAction(config));
    }

    updateServerMsgSubscribeState(message: string, status: boolean): void {
        this.store.dispatch(new ToggleSubscribeServerSendMessageTypeAction({ message, status }));
    }

    /**
     * 清除应用周期内的用户信息
     */
    private clearUserInfo(): void {
        this.isLogoutSuccess().pipe(
            take(1)
        ).subscribe(isLogoutSuccess => {
            if (isLogoutSuccess) {
                localStorage.clear();

                this.store.dispatch(new ClearLoginInfoAction());
            } else {
                // nothing to do;
            }
        });
    }

    /**
     * 用户退出后清除logout的响应信息，否则在未关闭窗口时再次登录会被重定向到home页面
     */
    clearLogoutInfo(): void {
        this.store.dispatch(new ResetLogoutResponseAction());
    }

    //  =======================================================Error Handle=======================================================

    /**
     * @ignore
     */
    handleSettingsError(): Subscription {
        return this.error.handleResponseError(this.getSettingsResponse());
    }

    /**
     * @ignore
     */
    handlePublicError(): Subscription {
        return this.error.handleError(this.getError());
    }

    /**
     * @ignore
     */
    handleLogoutError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getLogoutResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
    /**
     * @ignore
     */
    handleChangeAlertThresholdError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getChangeAlertThresholdSettingResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
