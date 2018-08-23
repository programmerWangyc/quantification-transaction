import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../providers/account.service';
import { Observable, of } from 'rxjs';
import { RegisterCode } from '../../interfaces/response.interface';
import * as moment from 'moment';
import { Breadcrumb } from '../../interfaces/app.interface';
import { TranslateService } from '@ngx-translate/core';
import { mergeMap } from 'rxjs/operators';

@Component({
    selector: 'app-register-code',
    templateUrl: './register-code.component.html',
    styleUrls: ['./register-code.component.scss'],
})
export class RegisterCodeComponent implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }, { name: 'REGISTER_CODE' }];

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    codes: Observable<RegisterCode[]>;

    /**
     * @ignore
     */
    statistics: Observable<string>;

    /**
     * @ignore
     */
    pageSize = 20;

    constructor(
        private accountService: AccountService,
        private translate: TranslateService,
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
    initialModel(): void {
        this.codes = this.accountService.getRegisterCodeResult();

        this.statistics = this.codes.pipe(
            mergeMap(data => this.translate.get('PAGINATION_STATISTICS', { total: data.length, page: Math.ceil(data.length / this.pageSize) }))
        );
    }

    /**
     * @ignore
     */
    launch(): void {
        this.accountService.launchGetRegisterCode(of({ offset: -1, limit: -1, magic1: -1 }));
    }

    /**
     * @ignore
     */
    isExpired(code: RegisterCode): boolean {
        return moment(code.expire_date).diff(moment()) < 0;
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

}
