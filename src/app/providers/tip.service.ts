import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { CustomSnackBarComponent } from '../tool/tool.components';
import { NzNotificationService } from 'ng-zorro-antd';
import { ConfirmOperateTipData } from '../interfaces/constant.interface';

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
    ) { }

    showTip(data: string, duration = 3000): MatSnackBarRef<CustomSnackBarComponent> {
        return this.snackBar.openFromComponent(CustomSnackBarComponent, {
            data,
            duration,
            verticalPosition: 'top'
        });
    }

    success(content: string, title = '', option = this.NZ_NOTIFICATION_CONFIG): void {
        this.translate.get(content).subscribe(content => {
            this.notification.success(title, content, option)
        }, error => console.log(error), () => console.log('translate complete'));
    }

    confirmOperateTip(component: any, data: ConfirmOperateTipData): Observable<boolean> {
        return this.dialog.open(component, { data, ...this.confirmConfig })
            .afterClosed();
    }

}

