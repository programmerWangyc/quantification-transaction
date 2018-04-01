import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';

import { CustomSnackBarComponent } from '../tool/tool.components';

@Injectable()
export class TipService {

    constructor(private snackBar: MatSnackBar) { }

    showTip(data: string, duration = 3000): MatSnackBarRef<CustomSnackBarComponent> {
        return this.snackBar.openFromComponent(CustomSnackBarComponent, {
            data,
            duration,
            verticalPosition: 'top'
        });
    }
}

