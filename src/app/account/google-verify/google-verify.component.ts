import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { isEmpty } from 'lodash';
import { Observable, of, Subject } from 'rxjs';
import { map, mergeMap, takeWhile, withLatestFrom } from 'rxjs/operators';

import { FormTypeBaseComponent } from '../base/base';
import { Breadcrumb } from '../../interfaces/app.interface';
import { AccountService } from '../providers/account.service';

@Component({
    selector: 'app-google-verify',
    templateUrl: './google-verify.component.html',
    styleUrls: ['./google-verify.component.scss'],
})
export class GoogleVerifyComponent extends FormTypeBaseComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'GOOGLE_VERIFY' }];

    /**
     * @ignore
     */
    qrcode: Observable<string>;

    /**
     * key
     */
    step3: Observable<string>;

    /**
     * submit button text
     */
    btnText: Observable<string>;

    /**
     * submit button type
     */
    btnType: Observable<string>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * secondary verify code;
     */
    code: string;

    /**
     * @ignore
     */
    submit$: Subject<string> = new Subject();

    /**
     * @ignore
     */
    labelSm = 10;

    /**
     * @ignore
     */
    controlSm = 14;

    constructor(
        private accountService: AccountService,
        private translate: TranslateService,
    ) {
        super();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel(): void {
        this.qrcode = this.accountService.getGoogleSecondaryVerifyCode();

        this.step3 = this.accountService.getGoogleAuthKey().pipe(
            mergeMap(({ key }) => this.translate.get('BIND_GOOGLE_VERIFY_STEP_3', { key }))
        );

        const isBind = this.accountService.getGoogleAuthKey().pipe(
            map(({ key }) => isEmpty(key))
        );

        this.btnText = isBind.pipe(
            map(bind => bind ? 'UNBIND' : 'BIND')
        );

        this.btnType = isBind.pipe(
            map(bind => bind ? 'danger' : 'primary')
        );
    }

    /**
     * @ignore
     */
    launch(): void {
        this.accountService.launchGetGoogleAuthKey(of(null));

        this.accountService.handleGoogleAuthKeyError(() => this.isAlive);

        this.accountService.launchBindGoogleAuth(
            this.submit$.pipe(
                withLatestFrom(
                    this.accountService.getGoogleAuthKey(),
                    (code, { key }) => ({ code, key })
                ),
                takeWhile(() => this.isAlive)
            )
        );

        this.accountService.handleBindGoogleAuthError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
