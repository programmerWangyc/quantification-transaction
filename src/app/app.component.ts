import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';

import { PublicService } from './providers/public.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    subscription$$: Subscription;

    isLogin: Observable<boolean>;

    constructor(
        private translate: TranslateService,
        private pubService: PublicService,
    ) { }

    ngOnInit() {
        this.initLanguage();

        this.isLogin = this.pubService.isLogin();

        this.subscription$$ = this.pubService.updateInformation()
            .add(this.pubService.getLanguage().subscribe(lang => this.translate.use(lang)))
            .add(this.pubService.handlePublicError())
            .add(this.pubService.saveReferrer());
    }

    initLanguage(): void {
        this.translate.setDefaultLang('zh');

        const actualLanguage = this.translate.getBrowserLang() || 'zh';

        this.translate.use(actualLanguage);

        actualLanguage === 'zh' && moment.locale('zh-cn');

    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
