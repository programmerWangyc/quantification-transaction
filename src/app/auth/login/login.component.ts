import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, tap, takeWhile } from 'rxjs/operators';

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
    isAlive = true;

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
            this.login$.asObservable().pipe(
                map(data => ({ ...data, password: this.encrypt.encryptPassword(data.password) })))
        );

        const keepAlive = () => this.isAlive;

        this.authService.isLoginSuccess().pipe(
            filter(success => success),
            takeWhile(keepAlive)
        ).subscribe(_ => this.router.navigateByUrl('/dashboard'))

        this.authService.handleLoginError(keepAlive);

        this.username.valueChanges.pipe(
            takeWhile(keepAlive)
        ).subscribe(_ => this.authService.closeSecondaryVerify());
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

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
