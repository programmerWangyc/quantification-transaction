import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';

import { FormTypeBaseComponent } from '../../base/base.component';
import { Breadcrumb } from '../../interfaces/app.interface';
import { EncryptService } from '../../providers/encrypt.service';
import { passwordMatchValidator, passwordValidator } from '../../validators/validators';
import { AccountService } from '../providers/account.service';

interface ChangePasswordForm {
    oldPwd: string;
    password: string;
    confirmPassword: string;
}

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent extends FormTypeBaseComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'MODIFY_PWD' }];

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * 请求流
     */
    submit$: Subject<ChangePasswordForm> = new Subject();

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private accountService: AccountService,
        private encrypt: EncryptService,
        private fb: FormBuilder,
    ) {
        super();
        this.initForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.launch();
    }

    /**
     * @ignore
     */
    launch(): void {
        this.accountService.launchChangePassword(
            this.submit$.pipe(
                takeWhile(() => this.isAlive),
                map(({ oldPwd, password }) => ({ oldPassword: this.encrypt.encryptPassword(oldPwd), newPassword: this.encrypt.encryptPassword(password) })),
            )
        );

        this.accountService.handleChangePasswordError(() => this.isAlive);

        this.accountService.isChangePasswordSuccess().pipe(
            takeWhile(() => this.isAlive),
            filter(isSuccess => isSuccess)
        ).subscribe(_ => this.form.reset());
    }

    /**
     * @ignore
     */
    initialModel() { }

    /**
     * @ignore
     */
    initForm(): void {
        this.form = this.fb.group({
            oldPwd: ['', [Validators.required, passwordValidator]],
            password: ['', [Validators.required, passwordValidator]],
            confirmPassword: ['', [Validators.required, passwordValidator]],
        }, { validator: passwordMatchValidator });
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

    /**
     * @ignore
     */
    get oldPwd(): AbstractControl {
        return this.form.get('oldPwd');
    }

    /**
     * @ignore
     */
    get password(): AbstractControl {
        return this.form.get('password');
    }

    /**
     * @ignore
     */
    get confirmPassword(): AbstractControl {
        return this.form.get('confirmPassword');
    }
}
