import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material';

@Component({
    selector: 'custom-snack-bar',
    template: `
        <span>{{message | translate}}<i (click)="close()" class="close anticon anticon-close"></i></span>`,
    styles: [`
        .close {
            float: right;
            cursor: pointer;
        }`]
})
export class CustomSnackBarComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public message: string,
        private snackBar: MatSnackBar
    ) { }

    close(): void {
        this.snackBar.dismiss();
    }
}