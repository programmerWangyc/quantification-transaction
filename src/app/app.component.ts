import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import { en_US, NzI18nService } from 'ng-zorro-antd';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { Path } from './app.config';
import { PublicService } from './providers/public.service';
import { RoutingService } from './providers/routing.service';

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
    isDashboard: Observable<boolean>;

    constructor(
        private translate: TranslateService,
        private pubService: PublicService,
        private router: Router,
        private nzI18nService: NzI18nService,
        private routing: RoutingService,
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
        this.isDashboard = this.routing.getCurrentUrl().pipe(
            map(path => path && path.includes(Path.dashboard))
        );
    }

    /**
     * 应用启动时检查一次是否保存有用户的登录信息，如果有跳转到登录后的页面
     */
    private directTo() {
        this.pubService.isLogin().pipe(
            take(1)
        ).subscribe(hasLogged => hasLogged && this.router.navigateByUrl(location.pathname));
    }

    /**
     * 初始化应用语言，配置moment.js使用的语言；
     */
    private initLanguage(): void {
        this.translate.setDefaultLang('zh');

        const actualLanguage = this.translate.getBrowserLang() || 'zh';

        this.translate.use(actualLanguage);

        actualLanguage === 'zh' && moment.locale('zh-cn');

        if (actualLanguage === 'zh') {
            moment.locale('zh-cn');
        } else {
            this.nzI18nService.setLocale(en_US);
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
