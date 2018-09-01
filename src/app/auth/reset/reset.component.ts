import { Component } from '@angular/core';

import { Subject, Subscription } from 'rxjs';

import { BaseComponent } from '../../base/base.component';
import { AuthService } from '../../shared/providers/auth.service';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss'],
})
export class ResetComponent extends BaseComponent {

    email: string;

    resetPassword$: Subject<string> = new Subject();

    subscription$$: Subscription;

    inputSize = 'large';

    /**
     * @ignore
     */
    isAlive = true;
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
        this.subscription$$ = this.authService.launchRegain(this.resetPassword$.asObservable());

        const keepAlive = () => this.isAlive;

        this.authService.showResetPasswordResponse(keepAlive);

        this.authService.handleResetPasswordError(keepAlive);
    }

    ngOnDestroy() {
        this.isAlive = false;

        this.subscription$$.unsubscribe();

        this.authService.resetResetPasswordResponse();
    }

}
