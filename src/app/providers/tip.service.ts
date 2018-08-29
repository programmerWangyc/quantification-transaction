import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { isBoolean } from 'lodash';
import {
    ModalOptions, NzMessageDataOptions, NzMessageService, NzModalRef, NzModalService, NzNotificationService
} from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { ApiActions } from '../store/index.action';

@Injectable()
export class TipService extends BaseService {

    private NZ_NOTIFICATION_CONFIG = {
        nzTop: '48px',
        nzRight: '50%',
        nzDuration: 5000,
        nzMaxStack: 3,
        nzPauseOnHover: true,
        nzAnimate: true,
    };

    constructor(
        private notification: NzNotificationService,
        private translate: TranslateService,
        private message: NzMessageService,
        private nzModal: NzModalService,
    ) {
        super();
    }

    /**
     * NzNotificationService secondary wrap.
     */
    success(msg: string, title = '', option = this.NZ_NOTIFICATION_CONFIG): void {
        this.translate.get(msg)
            .subscribe(content => {
                this.notification.success(title, content, option);
            },
                error => console.log(error),
                () => console.log('translate complete')
            );
    }

    /**
     * NzMessageService secondary wrap.
     */
    messageSuccess(msg: string, options?: NzMessageDataOptions): void {
        this.translate.get(msg).subscribe(content => this.message.success(content, options));
    }

    messageError(msg: string, params = {}, options?: NzMessageDataOptions): void {
        this.translate.get(msg, params).subscribe(content => this.message.error(content, options));
    }

    messageInfo(msg: string, params?: Object, option?: NzMessageDataOptions): void {
        this.translate.get(msg, params).subscribe(content => this.message.info(content, option));
    }

    notificationInfo(msg: string, title = '', option = this.NZ_NOTIFICATION_CONFIG): void {
        const labels = title ? [msg, title] : [msg];

        this.translate.get(labels).subscribe(res => this.notification.info(res[title] || '', res[msg], option));
    }

    /**
     * NzModalService secondary wrap.
     */
    getNzConfirmOperateConfig(): Observable<object> {
        return this.translate.get(['OPERATE_CONFIRM', 'CONFIRM', 'CANCEL']).pipe(
            map(res => ({
                nzTitle: res.OPERATE_CONFIRM,
                nzOkText: res.CONFIRM,
                nzCancelText: res.CANCEL,
                nzOkType: 'primary',
            }))
        );
    }

    /**
     * Custom method related with tip functional.
     */
    playAudio(src: string): void {
        const audio = new Audio();

        audio.src = src;

        audio.load();

        audio.play();
    }

    /**
     * @ignore
     */
    messageByResponse<T extends ApiActions>(successMsg: string, failMsg: string, isSuccess?: (result: any) => boolean): (action: T) => void {
        return (action: T) => {
            if (isSuccess ? isSuccess(action.payload.result) : !!action.payload.result) {
                this.messageSuccess(successMsg);
            } else {
                this.messageError(failMsg);
            }
        };
    }

    /**
     * Close loading state if timeout as the same time show tip message for user;
     * @param input loading state or error message object
     */
    loadingSlowlyTip = (input: boolean | object): boolean => {
        if (isBoolean(input)) {
            return input;
        } else {
            this.notificationInfo('LOADING_LONG_TIME_NOTIFICATION', 'SLOW_NET_WORK');
            return false;
        }
    }

    /**
     * 确认是否要执行高危操作
     * @param message to be translated message;
     * @param options Translate params;
     * @param config  Modal options
     * @param onlyTrue Whether the output observable only emit 'true' value;
     */
    guardRiskOperate(message: string, options: { [key: string]: any } = {}, config: ModalOptions = {}, onlyTrue = true): Observable<boolean> {
        return this.translate.get(message, options).pipe(
            mergeMap(content => {
                const modal: NzModalRef = this.nzModal.confirm(Object.assign({
                    nzContent: content,
                    nzOnOk: () => modal.close(true),
                    nzOnCancel: () => modal.close(false),
                }, config));

                return onlyTrue ? modal.afterClose.pipe(
                    this.filterTruth()
                ) : modal.afterClose;
            })
        );
    }

    /**
     * 验证密码成功后的通知流；和exchange。form.service上的方法一样，因为循环引用懒得优化
     */
    securityVerify(component: any): Observable<boolean> {
        const modal = this.nzModal.confirm({
            nzContent: component,
            nzTitle: this.unwrap(this.translate.get('SECURITY_VERIFY')),
            nzOkText: null,
            nzCancelText: null,
        });

        return modal.afterClose;
    }
}

