import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { isEmpty } from 'lodash';
import { Observable, of, Subscription } from 'rxjs';
import { map, mapTo, switchMap, takeWhile } from 'rxjs/operators/';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class AccountService extends BaseService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private errorService: ErrorService,
        private tipService: TipService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchChangePassword(params: Observable<fromReq.ChangePasswordRequest>): Subscription {
        return this.process.processChangePassword(params);
    }

    /**
     * @ignore
     */
    launchChangeNickname(params: Observable<fromReq.ChangeNickNameRequest>): Subscription {
        return this.process.processChangeNickname(params);
    }

    /**
     * @ignore
     */
    launchGetGoogleAuthKey(params: Observable<fromReq.GetGoogleAuthKeyRequest>): Subscription {
        return this.process.processGetGoogleAuthKey(params);
    }

    /**
     * @ignore
     */
    launchUnbindSNS(params: Observable<fromReq.UnbindSNSRequest>): Subscription {
        return this.process.processUnbindSNS(params.pipe(
            switchMap(_ => this.tipService.guardRiskOperate('CONFIRM_UNBIND_WECHAT'))
        ));
    }

    /**
     * @ignore
     */
    launchBindGoogleAuth(params: Observable<fromReq.BindGoogleAuthRequest>): Subscription {
        return this.process.processBindGoogleAuth(
            params.pipe(
                switchMap(({ code, key }) => isEmpty(key) ? this.tipService.guardRiskOperate('CONFIRM_UNBIND_GOOGLE_VERIFY_CODE').pipe(
                    mapTo({ code, key })
                ) : of({ code, key }))
            )
        );
    }

    /**
     * @ignore
     */
    launchGetRegisterCode(params: Observable<fromReq.GetRegisterCodeRequest>): Subscription {
        return this.process.processGetRegisterCodeKey(params);
    }

    //  =======================================================Data acquisition=======================================================

    /**
     * @ignore
     */
    private getChangePasswordResponse(): Observable<fromRes.ChangePasswordResponse> {
        return this.store.pipe(
            select(fromRoot.selectChangePasswordResponse),
            this.filterTruth()
        );
    }

    /**
     * 密码成功的响应流
     */
    isChangePasswordSuccess(): Observable<boolean> {
        return this.getChangePasswordResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getChangeNicknameResponse(): Observable<fromRes.ChangeNickNameResponse> {
        return this.store.pipe(
            select(fromRoot.selectChangeNicknameResponse),
            this.filterTruth()
        );
    }

    /**
     * 昵称修改的响应流
     */
    isChangeNicknameSuccess(): Observable<boolean> {
        return this.getChangeNicknameResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getGoogleAuthKeyResponse(): Observable<fromRes.GetGoogleAuthKeyResponse> {
        return this.store.pipe(
            select(fromRoot.selectGoogleAuthKeyResponse),
            this.filterTruth()
        );
    }

    /**
     * Google auth key result;
     */
    getGoogleAuthKey(): Observable<fromRes.GoogleAuthKey> {
        return this.getGoogleAuthKeyResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * 绑定谷歌验证时的二维码信息
     */
    getGoogleSecondaryVerifyCode(): Observable<string> {
        return this.getGoogleAuthKey().pipe(
            map(({ key }) => `otpauth://totp/BotVS?secret=${key}`)
        );
    }

    /**
     * @ignore
     */
    private getUnbindSNSResponse(): Observable<fromRes.UnbindSNSResponse> {
        return this.store.pipe(
            select(fromRoot.selectUnbindSNSResponse),
            this.filterTruth()
        );
    }

    /**
     * Unbind sns result;
     */
    isUnbindSNSSuccess(): Observable<boolean> {
        return this.getUnbindSNSResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getBindGoogleAuthKeyResponse(): Observable<fromRes.BindGoogleAuthResponse> {
        return this.store.pipe(
            select(fromRoot.selectBindGoogleAuthResponse),
            this.filterTruth()
        );
    }

    /**
     * 绑定或解绑谷歌验证码后的响应结果
     */
    getBindGoogleAuthKeyResult(): Observable<fromRes.GoogleAuthKey> {
        return this.getBindGoogleAuthKeyResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    private getRegisterCodeResponse(): Observable<fromRes.GetRegisterCodeResponse> {
        return this.store.pipe(
            select(fromRoot.selectRegisterCodeResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getRegisterCodeResult(): Observable<fromRes.RegisterCode[]> {
        return this.getRegisterCodeResponse().pipe(
            map(res => res.result.items)
        );
    }


    //  =======================================================UI state =======================================================

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleChangePasswordError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getChangePasswordResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleChangeNicknameError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getChangeNicknameResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleGoogleAuthKeyError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getGoogleAuthKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleUnbindSNSError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getUnbindSNSResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleBindGoogleAuthError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getBindGoogleAuthKeyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleGetRegisterCodeError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getRegisterCodeResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
