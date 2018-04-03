import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { BusinessComponent, SignupFormModel } from '../../interfaces/business.interface';
import { emailValidator, passwordMatchValidator, passwordValidator, usernameValidator } from '../../validators/validators';
import { EncryptService } from './../../providers/encrypt.service';
import { PublicService } from './../../providers/public.service';
import { AgreementComponent } from './../agreement/agreement.component';
import { AuthService } from './../providers/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent extends BusinessComponent {

    subscription$$: Subscription;

    signupForm: FormGroup;

    signup$: Subject<SignupFormModel> = new Subject();

    isAgree: Observable<boolean>;

    tipPosition = 'after';

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
        this.isAgree = this.authService.isAgree();
    }

    launch(): void {
        this.subscription$$ = this.authService.launchSignup(this.signup$.map(data => ({ username: data.username, email: data.email, password: this.encrypt.encryptPassword(data.passwordInfo.password), refUser: '', refUrl: '' })))
            .add(this.authService.toggleAgreeState(this.toggleAgree$.merge(this.getDialogResult())))
            .add(this.activatedRoute.params.map(params => params['ref']).filter(ref => !!ref).subscribe(this.publicService.refUser$$))
            .add(this.authService.isSignupSuccess().filter(success => !!success).subscribe(_ => this.router.navigateByUrl('/home')))
            .add(this.authService.showSignupResponse())
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
