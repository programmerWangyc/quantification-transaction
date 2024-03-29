import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { EncryptService } from '../../providers/encrypt.service';
import { AuthService } from '../../shared/providers/auth.service';
import { passwordMatchValidator, passwordValidator } from '../../validators/validators';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
})
export class PasswordComponent extends BaseComponent {

    subscription$$: Subscription;

    pwdForm: FormGroup;

    setPwd$: Subject<string> = new Subject();

    tipPosition = 'after';

    inputSize = 'large';

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private encrypt: EncryptService,
        private fb: FormBuilder,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
    ) {
        super();
        this.createFrom();
    }

    ngOnInit() {
        this.launch();
    }

    initialModel() { }

    launch() {
        this.subscription$$ = this.authService.launchSetPwd(
            combineLatest(
                this.setPwd$.pipe(
                    map(password => this.encrypt.encryptPassword(password))
                ),
                this.activatedRoute.params.pipe(
                    map(param => param['token'])
                )
            ).pipe(
                map(([password, token]) => ({ password, token }))
            )
        );

        const keepAlive = () => this.isAlive;

        this.authService.showSetPasswordResponse(keepAlive);

        this.authService.handleSetPasswordError(keepAlive);
    }

    createFrom(): void {
        this.pwdForm = this.fb.group({
            password: ['', passwordValidator],
            confirmPassword: ['', passwordValidator],
        }, { validator: passwordMatchValidator });
    }

    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();

        this.authService.resetSetPasswordResponse();
    }

    get password(): AbstractControl {
        return this.pwdForm.get('password');
    }

    get confirmPassword(): AbstractControl {
        return this.pwdForm.get('confirmPassword');
    }
}
