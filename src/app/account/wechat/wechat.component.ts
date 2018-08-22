import { Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, of, Subject } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators/';

import { Breadcrumb } from '../../interfaces/app.interface';
import { AccountService } from '../providers/account.service';

@Component({
    selector: 'app-wechat',
    templateUrl: './wechat.component.html',
    styleUrls: ['./wechat.component.scss'],
})
export class WechatComponent implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'BIND_WECHART' }];

    /**
     * @ignore
     */
    unbind$: Subject<boolean> = new Subject();

    /**
     * 是否已绑定微信号
     */
    isBind: Observable<boolean>;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private accountService: AccountService,
    ) { }

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
    initialModel() {
        this.isBind = this.accountService.getGoogleAuthKey().pipe(
            map(res => !res.snskey)
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.accountService.launchGetGoogleAuthKey(of(null));

        this.accountService.handleGoogleAuthKeyError(() => this.isAlive);

        this.accountService.launchUnbindSNS(this.unbind$.pipe(
            takeWhile(() => this.isAlive)
        ));

        this.accountService.handleUnbindSNSError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
