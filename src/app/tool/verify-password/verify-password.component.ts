import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { EncryptService } from '../../providers/encrypt.service';
import { AuthService } from '../../shared/providers/auth.service';


@Component({
    selector: 'app-verify-password',
    templateUrl: './verify-password.component.html',
    styleUrls: ['./verify-password.component.scss']
})
export class VerifyPasswordComponent extends BaseComponent {

    verify$: Subject<string> = new Subject();

    subscription$$: Subscription;

    password: string;

    size = 'large';

    constructor(
        private authService: AuthService,
        private encryptService: EncryptService,
    ) {
        super();
    }

    ngOnInit() {
        this.authService.resetVerifyPwdResponse();

        this.launch();
    }

    launch() {
        this.subscription$$ = this.authService.launchVerifyPassword(this.verify$
            .pipe(
                map(password => ({ password: this.encryptService.encryptPassword(password) }))
            )
        )
            .add(this.authService.storePwdTemporary(this.verify$))

        this.authService.handleVerifyPasswordError();
    }

    initialModel() {

    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
