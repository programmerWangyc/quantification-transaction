import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { AuthService } from './../providers/auth.service';
import { BusinessComponent } from '../../interfaces/business.interface';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss']
})
export class ResetComponent extends BusinessComponent {

    email: string;

    resetPassword$: Subject<string> = new Subject();

    subscription$$: Subscription;

    constructor(
        private authService: AuthService,
    ) {
        super();
    }

    ngOnInit() {
        this.launch();
    }

    initialModel() { }

    launch() {
        this.subscription$$ = this.authService.launchRegain(this.resetPassword$)
            .add(this.authService.showResetPasswordResponse())
            .add(this.authService.handleResetPasswordError());
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
