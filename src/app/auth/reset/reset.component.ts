import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { BusinessComponent } from '../../interfaces/business.interface';
import { AuthService } from '../../shared/providers/auth.service';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss']
})
export class ResetComponent extends BusinessComponent {

    email: string;

    resetPassword$: Subject<string> = new Subject();

    subscription$$: Subscription;

    inputSize = 'large';

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

        this.authService.resetResetPasswordResponse();
    }

}
