import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { BusinessComponent } from '../../interfaces/business.interface';
import { Robot } from '../../interfaces/response.interface';
import { RobotService } from './../providers/robot.service';

@Component({
    selector: 'app-robot',
    templateUrl: './robot.component.html',
    styleUrls: ['./robot.component.scss']
})
export class RobotComponent extends BusinessComponent {
    subscription$$: Subscription;

    data: Observable<Robot[]>;

    paths = ['CONTROL_CENTER', 'ROBOT'];

    @ViewChild('ng-template') template;

    constructor(
        private robot: RobotService,
        private dialog: MatDialog,
    ) {
        super();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel() {
        this.data = this.robot.getRobots().startWith([]);
    }

    launch() {
        this.subscription$$ = this.robot.launchRobotList(Observable.of({ start: -1, limit: -1, status: -1 }))
            .add(this.robot.handleRobotListError());
    }

    togglePublicStatus(target: Robot): void {
        const message = target.public ? 'CANCEL_PUBLISH_ROBOT' : 'PUBLISH_ROBOT';

        this.dialog.open(RobotPublishConfirmComponent, { data: message, panelClass: ['radius'], minWidth: 520, position: {top: '50px'} }).afterClosed().subscribe(v => console.log(v));
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}

@Component({
    selector: 'app-robot-publish-confirm',
    template: `
        <p>{{'OPERATE_CONFIRM' | translate}}</p>
        <mat-dialog-content>{{ data | translate}}</mat-dialog-content>
        <mat-dialog-actions>
            <button nz-button [nzSize]="'large'" [mat-dialog-close]="false" style="margin-right: 20px;">
                {{'CANCEL' | translate}}
            </button>
            <button nz-button [nzType]="'primary'" [nzSize]="'large'" [mat-dialog-close]="true">
                {{'CONFIRM' | translate}}
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `p {
            padding: 13px 16px;
            border-radius: 4px 4px 0 0;
            background: #fff;
            color: rgba(0,0,0,.65);
            border-bottom: 1px solid #e9e9e9;
            margin: 0;
            line-height: 21px;
            font-weight: 500;
            color: rgba(0,0,0,.85);
            font-size: 16px;
        }`,
        `.mat-dialog-content {
            padding: 16px;
            margin:0;
            line-height: 1.5;
            display: block;
            overflow: auto;
            max-height: 65vh;
        }`,
        `.mat-dialog-actions {
            border-top: 1px solid #e9e9e9;
            padding: 10px 16px 10px 10px;
            text-align: right;
            border-radius: 0 0 4px 4px;
            justify-content: flex-end 
        }`,
    ]
})
export class RobotPublishConfirmComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }
}