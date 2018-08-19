import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { LoginRequest } from '../../interfaces/request.interface';
import { EncryptService } from '../../providers/encrypt.service';
import { AuthService } from '../../shared/providers/auth.service';
import { passwordValidator, usernameValidator } from '../../validators/validators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent {

    /**
     * @ignore
     */
    loginForm: FormGroup;

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    login$: Subject<LoginRequest> = new Subject();

    /**
     * @ignore
     */
    needVerification: Observable<boolean>;

    /**
     * @ignore
     */
    tipPosition = 'after';

    /**
     * @ignore
     */
    inputSize = 'large';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private encrypt: EncryptService,
        private router: Router,
    ) {
        super();
        this.authService.resetLoginInfo();
        this.createForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel(): void {
        this.needVerification = this.authService.needVerification().pipe(
            tap(need => {
                this.verificationCode.setValidators(need ? [Validators.required] : null);
                this.verificationCode.updateValueAndValidity();
            })
        );
    }

    /**
     * @ignore
     */
    createForm(): void {
        this.loginForm = this.fb.group({
            username: ['', usernameValidator],
            password: ['', passwordValidator],
            verificationCode: '',
        });
    }

    /**
     * @ignore
     */
    launch(): void {
        this.subscription$$ = this.authService.launchLogin(
            this.login$.pipe(
                map(data => ({ ...data, password: this.encrypt.encryptPassword(data.password) }))
            )
        )
            .add(this.authService.isLoginSuccess().pipe(
                filter(success => success)
            )
                .subscribe(_ => this.router.navigateByUrl('/dashboard/robot'))
            )
            .add(this.username.valueChanges.subscribe(_ => this.authService.closeSecondaryVerify()))
            .add(this.authService.handleLoginError());
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

    /**
     * @ignore
     */
    get username(): AbstractControl {
        return this.loginForm.get('username');
    }

    /**
     * @ignore
     */
    get password(): AbstractControl {
        return this.loginForm.get('password');
    }

    /**
     * @ignore
     */
    get verificationCode(): AbstractControl {
        return this.loginForm.get('verificationCode');
    }

}
