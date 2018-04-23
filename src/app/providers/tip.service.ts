import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { CustomSnackBarComponent } from '../tool/tool.components';

@Injectable()
export class TipService {

    private confirmConfig = {
        panelClass: ['radius'],
        minWidth: 520,
        position: { top: '50px' }
    }

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
    ) { }

    showTip(data: string, duration = 3000): MatSnackBarRef<CustomSnackBarComponent> {
        return this.snackBar.openFromComponent(CustomSnackBarComponent, {
            data,
            duration,
            verticalPosition: 'top'
        });
    }

    confirmOperateTip(component: any, data: any): Observable<boolean> {
        return this.dialog.open(component, { data, ...this.confirmConfig })
            .afterClosed();
    }

}

