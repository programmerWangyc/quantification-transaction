import { Component } from '@angular/core';

import { NzModalRef } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { map, takeWhile, distinctUntilChanged } from 'rxjs/operators';

import { BaseComponent } from '../../base/base.component';
import { EncryptService } from '../../providers/encrypt.service';
import { AuthService } from '../../shared/providers/auth.service';

@Component({
    selector: 'app-verify-password',
    templateUrl: './verify-password.component.html',
    styleUrls: ['./verify-password.component.scss'],
})
export class VerifyPasswordComponent extends BaseComponent {

    verify$: Subject<string> = new Subject();

    password: string;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private authService: AuthService,
        private encryptService: EncryptService,
        private modalRef: NzModalRef,
    ) {
        super();
    }

    ngOnInit() {
        this.authService.resetVerifyPwdResponse();

        this.launch();
    }

    launch() {
        const keepAlive = () => this.isAlive;

        const verify = this.verify$.asObservable().pipe(
            takeWhile(keepAlive)
        );

        this.authService.launchVerifyPassword(verify.pipe(
            distinctUntilChanged(),
            map(password => ({ password: this.encryptService.encryptPassword(password) }))
        ));

        this.authService.storePwdTemporary(verify);

        this.authService.handleVerifyPasswordError(keepAlive);

        this.authService.isVerifyPasswordSuccess().pipe(
            takeWhile(keepAlive)
        ).subscribe(isSuccess => {
            if (isSuccess) {
                this.destroy(true);
            } else {
                this.password = null;
            }
        });
    }

    initialModel() {

    }

    destroy(result: boolean) {
        this.modalRef.close(result);
    }

    ngOnDestroy() {
        this.isAlive = false;
    }
}
