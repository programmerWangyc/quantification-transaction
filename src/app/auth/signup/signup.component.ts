import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject ,  Observable ,  Subscription } from 'rxjs';

import { BaseComponent } from '../../base/base.component';
import { AuthService } from '../../shared/providers/auth.service';
import { emailValidator, passwordMatchValidator, passwordValidator, usernameValidator } from '../../validators/validators';
import { AgreementComponent } from '../agreement/agreement.component';
import { EncryptService } from './../../providers/encrypt.service';
import { PublicService } from './../../providers/public.service';

export interface SignupFormModel {
    username: string;
    email: string;
    passwordInfo: {
        password: string;
        confirmPassword: string;
    }
}

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent extends BaseComponent {

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
        this.subscription$$ = this.authService.launchSignup(this.signup$.map(data => ({ username: data.username, email: data.email, password: this.encrypt.encryptPassword(data.passwordInfo.password), refUser: '', refUrl: '' })))
            .add(this.authService.toggleAgreeState(this.toggleAgree$.merge(this.getDialogResult())))
            .add(this.activatedRoute.params.map(params => params['ref']).filter(ref => !!ref).subscribe(this.publicService.refUser$$))
            .add(this.authService.isSignupSuccess().filter(success => !!success).subscribe(_ => this.router.navigateByUrl('/home')))
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
                confirmPassword: ['', passwordValidator]
            }, { validator: passwordMatchValidator })
        });
    }

    getDialogResult(): Observable<boolean> {
        return this.dialog$.filter(v => v)
            .mergeMap(_ => this.dialog.open(AgreementComponent).afterClosed().map(res => !!res));
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
