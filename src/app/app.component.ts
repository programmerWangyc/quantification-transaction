import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';

import { PublicService } from './providers/public.service';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    beforeLogin: Observable<boolean>;

    constructor(
        private translate: TranslateService,
        private pubService: PublicService,
        private router: Router,
    ) {
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initLanguage();

        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    private launch() {
        this.subscription$$ = this.pubService.updateInformation()
            .add(this.pubService.getLanguage().subscribe(lang => this.translate.use(lang)))
            .add(this.pubService.handlePublicError())
            .add(this.pubService.saveReferrer());

        this.directTo();
    }

    /**
     * @ignore
     */
    private initialModel(): void {
        this.beforeLogin = this.pubService.isLogin().pipe(
            map(logged => !logged)
        );
    }

    /**
     * 应用启动时检查一次是否保存有用户的登录信息，如果有跳转到登录后的页面
     */
    private directTo() {
        this.pubService.isLogin().pipe(
            take(1)
        ).subscribe(hasLogged => hasLogged && this.router.navigateByUrl('/dashboard/robot'));
    }

    /**
     * 初始化应的语言，配置moment.js使用的语言；
     */
    private initLanguage(): void {
        this.translate.setDefaultLang('zh');

        const actualLanguage = this.translate.getBrowserLang() || 'zh';

        this.translate.use(actualLanguage);

        actualLanguage === 'zh' && moment.locale('zh-cn');
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
