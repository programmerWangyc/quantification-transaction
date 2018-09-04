import { Component, OnDestroy, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import { en_US, NzI18nService } from 'ng-zorro-antd';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilKeyChanged, map, take, takeWhile } from 'rxjs/operators';

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
    isAlive = true;

    /**
     * @ignore
     */
    padding: Observable<string>;

    /**
     * @ignore
     */
    hideNav: Observable<boolean>;

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
        const keepAlive = () => this.isAlive;

        this.subscription$$ = this.pubService.updateInformation()
            .add(this.pubService.saveReferrer());

        this.pubService.getLanguage().pipe(
            takeWhile(keepAlive)
        ).subscribe(lang => this.translate.use(lang));

        this.pubService.handlePublicError(keepAlive);

        this.directTo();
    }

    /**
     * @ignore
     */
    private initialModel(): void {
        const source = this.routing.getCurrentRouteState().pipe(
            distinctUntilKeyChanged('url')
        );
        this.padding = source.pipe(
            map(({ url, routeConfig }) => {
                if (this.isNavHidden(url, routeConfig)) {
                    return '0';
                } else if (!url || url.includes(Path.home)) {
                    return '84px 0 0 0';
                } else {
                    return '98px 164px 0 164px';
                }
            })
        );

        this.hideNav = source.pipe(
            map(({ url, routeConfig }) => this.isNavHidden(url, routeConfig))
        );
    }

    private isNavHidden(url: string, routeConfig: Route): boolean {
        return routeConfig.path === '**' || url && url.includes(Path.dashboard);
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
        this.isAlive = false;

        this.subscription$$.unsubscribe();
    }
}
