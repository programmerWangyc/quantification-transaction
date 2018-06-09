import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageDataOptions, NzMessageService, NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';

import { ConfirmOperateTipData } from '../interfaces/app.interface';
import { CustomSnackBarComponent } from '../tool/tool.components';

@Injectable()
export class TipService {

    private confirmConfig = {
        panelClass: ['radius'],
        minWidth: 520,
        position: { top: '50px' }
    }

    private NZ_NOTIFICATION_CONFIG = {
        nzTop: '48px',
        nzRight: '50%',
        nzDuration: 3000,
        nzMaxStack: 3,
        nzPauseOnHover: true,
        nzAnimate: true,
    }

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private notification: NzNotificationService,
        private translate: TranslateService,
        private nzModal: NzModalService,
        private message: NzMessageService,
    ) { }


    /**
     * @description angular material related methods;
     */
    showTip(data: string, duration = 3000): MatSnackBarRef<CustomSnackBarComponent> {
        return this.snackBar.openFromComponent(CustomSnackBarComponent, {
            data,
            duration,
            verticalPosition: 'top'
        });
    }

    confirmOperateTip(component: any, data: ConfirmOperateTipData): Observable<boolean> {
        return this.dialog.open(component, { data, ...this.confirmConfig })
            .afterClosed();
    }

    /**
     * @description NzNotificationService secondary wrap.
     */
    success(content: string, title = '', option = this.NZ_NOTIFICATION_CONFIG): void {
        this.translate.get(content).subscribe(content => {
            this.notification.success(title, content, option)
        }, error => console.log(error), () => console.log('translate complete'));
    }

    /**
     * @description NzMessageService secondary wrap.
     */
    messageSuccess(content: string, options?: NzMessageDataOptions): void {
        this.translate.get(content).subscribe(content => this.message.success(content, options));
    }

    messageError(content: string, options?: NzMessageDataOptions): void {
        this.translate.get(content).subscribe(content => this.message.error(content, options));
    }

    messageInfo(content: string, params?: Object, option?: NzMessageDataOptions): void {
        this.translate.get(content, params).subscribe(content => this.message.info(content, option));
    }

    /**
     * @description NzModalService secondary wrap.
     */
    getNzConfirmOperateConfig(): Observable<object> {
        return this.translate.get(['OPERATE_CONFIRM', 'CONFIRM', 'CANCEL']).map(res => ({
            nzTitle: res.OPERATE_CONFIRM,
            nzOkText: res.CONFIRM,
            nzCancelText: res.CANCEL,
            nzOkType: 'primary',
        }));
    }

    /**
     * @description Custom method related with tip functional.
     */
    playAudio(src: string): void {
        const audio = new Audio();

        audio.src = src

        audio.load();

        audio.play();
    }

}

