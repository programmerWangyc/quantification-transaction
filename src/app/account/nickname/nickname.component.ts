import { Component, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';

import { FormTypeBaseComponent } from '../base/base';
import { Breadcrumb } from '../../interfaces/app.interface';
import { AccountService } from '../providers/account.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-nickname',
    templateUrl: './nickname.component.html',
    styleUrls: ['./nickname.component.scss'],
})
export class NicknameComponent extends FormTypeBaseComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'MODIFY_NICKNAME' }];

    /**
     * @ignore
     */
    nickname$: Subject<string> = new Subject();

    /**
     * @ignore
     */
    nickname: string;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    labelSm = 6;

    /**
     * @ignore
     */
    controlSm = 14;

    /**
     * @ignore
     */
    @ViewChild('nickForm') form: NgForm;

    constructor(
        private accountService: AccountService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.launch();
    }

    launch() {
        this.accountService.launchChangeNickname(
            this.nickname$.pipe(
                takeWhile(() => this.isAlive),
                map(name => ({ name }))
            )
        );

        this.accountService.isChangeNicknameSuccess().pipe(
            takeWhile(() => this.isAlive),
            filter(isSuccess => isSuccess)
        ).subscribe(_ => {
            this.nickname = void 0;

            this.form.resetForm();
        });

    }

    initialModel() {

    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

}
