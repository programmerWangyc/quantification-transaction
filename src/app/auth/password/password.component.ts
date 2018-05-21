import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { BusinessComponent } from '../../interfaces/business.interface';
import { AuthService } from '../../shared/providers/auth.service';
import { passwordMatchValidator, passwordValidator } from '../../validators/validators';
import { EncryptService } from './../../providers/encrypt.service';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent extends BusinessComponent {

    subscription$$: Subscription;

    pwdForm: FormGroup;

    setPwd$: Subject<string> = new Subject();

    tipPosition = 'after';

    inputSize = 'large';

    constructor(
        private encrypt: EncryptService,
        private fb: FormBuilder,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private route: Router,
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
            this.setPwd$.map(password => this.encrypt.encryptPassword(password))
                .combineLatest(
                    this.activatedRoute.params.map(param => param['token']),
                    (password, token) => ({ password, token })
                )
        )
            .add(this.authService.showSetPasswordResponse())
            .add(this.authService.handleSetPasswordError());
    }

    createFrom(): void {
        this.pwdForm = this.fb.group({
            password: ['', passwordValidator],
            confirmPassword: ['', passwordValidator]
        }, { validator: passwordMatchValidator });
    }

    ngOnDestroy() {
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
