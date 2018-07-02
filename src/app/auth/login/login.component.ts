import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, merge } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { LoginRequest } from '../../interfaces/request.interface';
import { AuthService } from '../../shared/providers/auth.service';
import { passwordValidator, usernameValidator } from '../../validators/validators';
import { EncryptService } from './../../providers/encrypt.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent {
    loginForm: FormGroup;

    subscription$$: Subscription;

    login$: Subject<LoginRequest> = new Subject();

    needVerification: Observable<boolean>;

    tipPosition = 'after';

    inputSize = 'large';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private encrypt: EncryptService,
        private router: Router,
    ) {
        super();
        this.createForm();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel(): void {
        this.needVerification = this.authService.needVerification()
            .pipe(
                tap(need => {
                    this.verificationCode.setValidators(need ? [Validators.required] : null);
                    this.verificationCode.updateValueAndValidity();
                })
            );
    }

    createForm(): void {
        this.loginForm = this.fb.group({
            username: ['', usernameValidator],
            password: ['', passwordValidator],
            verificationCode: ''
        });
    }

    launch(): void {
        this.subscription$$ = this.authService.launchLogin(
            this.login$.pipe(
                map(data => ({ ...data, password: this.encrypt.encryptPassword(data.password) }))
            )
        )
            .add(this.authService.isLoginSuccess()
                .pipe(
                    filter(success => success)
                )
                .subscribe(_ => this.router.navigateByUrl('/dashboard/robot'))
            )
            .add(this.username.valueChanges.subscribe(_ => this.authService.closeSecondaryVerify()))
            .add(this.authService.handleLoginError());
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.authService.resetLoginError();
    }

    get username(): AbstractControl {
        return this.loginForm.get('username');
    }

    get password(): AbstractControl {
        return this.loginForm.get('password');
    }

    get verificationCode(): AbstractControl {
        return this.loginForm.get('verificationCode');
    }

}
