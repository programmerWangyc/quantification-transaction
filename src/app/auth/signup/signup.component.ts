import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { EncryptService } from '../../providers/encrypt.service';
import { PublicService } from '../../providers/public.service';
import { AuthService } from '../../shared/providers/auth.service';
import {
    emailValidator, passwordMatchValidator, passwordValidator, usernameValidator
} from '../../validators/validators';
import { AgreementComponent } from '../agreement/agreement.component';

export interface SignupFormModel {
    username: string;
    email: string;
    passwordInfo: {
        password: string;
        confirmPassword: string;
    };
}

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent extends BaseComponent {

    labelSm = 6;

    labelSx = 24;

    controlSm = 14;

    controlXs = 24;

    subscription$$: Subscription;

    signupForm: FormGroup;

    signup$: Subject<SignupFormModel> = new Subject();

    isAgree = true;

    tipPosition = 'after';

    inputSize = 'large';

    toggleAgree$: Subject<boolean> = new Subject();

    dialog$: Subject<boolean> = new Subject();

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private encrypt: EncryptService,
        private activatedRoute: ActivatedRoute,
        private publicService: PublicService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        super();
        this.createForm();
    }

    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel(): void {
    }

    launch(): void {
        this.subscription$$ = this.authService.launchSignup(this.signup$.pipe(
            map(data => ({ username: data.username, email: data.email, password: this.encrypt.encryptPassword(data.passwordInfo.password), refUser: '', refUrl: '' }))
        )
        )
            .add(this.authService.toggleAgreeState(
                merge(
                    this.toggleAgree$,
                    this.getDialogResult()
                )
            )
            )
            .add(this.activatedRoute.params.pipe(
                map(params => params['ref']),
                filter(ref => !!ref)
            )
                .subscribe(this.publicService.refUser$$)
            )
            .add(this.authService.isSignupSuccess()
                .pipe(filter(success => !!success))
                .subscribe(_ => this.router.navigateByUrl('/home'))
            )
            .add(this.authService.showSignupResponse())
            .add(this.authService.isAgree().subscribe(agree => this.isAgree = agree))
            .add(this.authService.handleSignupError())
            .add(this.publicService.handleSettingsError());
    }

    createForm(): void {
        this.signupForm = this.fb.group({
            username: ['', usernameValidator],
            email: ['', emailValidator],
            passwordInfo: this.fb.group({
                password: ['', passwordValidator],
                confirmPassword: ['', passwordValidator],
            }, { validator: passwordMatchValidator }),
        });
    }

    getDialogResult(): Observable<boolean> {
        return this.dialog$.pipe(
            filter(v => v),
            mergeMap(_ => this.dialog.open(AgreementComponent).afterClosed()
                .pipe(
                    map(res => !!res)
                )
            )
        );
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();

        this.authService.resetSignupResponse();
    }

    get username(): AbstractControl {
        return this.signupForm.get('username');
    }

    get email(): AbstractControl {
        return this.signupForm.get('email');
    }

    get password(): AbstractControl {
        return this.signupForm.get('passwordInfo.password');
    }

    get confirmPassword(): AbstractControl {
        return this.signupForm.get('passwordInfo.confirmPassword');
    }
}
