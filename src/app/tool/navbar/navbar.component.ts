import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeWhile } from 'rxjs/operators';

import { LanguageMap } from '../../app.config';
import {
    analyzing, community, documentation, factFinder, main, NavItem, quoteChart, square
} from '../../base/base.config';
import { keepAliveFn } from '../../interfaces/app.interface';
import { PublicService } from '../../providers/public.service';
import { RoutingService } from '../../providers/routing.service';

export class NavBaseComponent {
    /**
     * @ignore
     */
    language$: Subject<string> = new Subject();

    /**
     * @ignore
     */
    language: Observable<string>;

    /**
     * @ignore
     */
    username: Observable<string>;

    constructor(
        public router: Router,
        public publicService: PublicService,
        public activatedRoute: ActivatedRoute,
        public routing: RoutingService,
    ) { }

    protected launch(keepAlive: keepAliveFn, monitor: (url: string) => void) {
        this.publicService.updateLanguage(this.language$.asObservable().pipe(
            takeWhile(keepAlive)
        ));

        this.routing.getCurrentUrl().pipe(
            takeWhile(keepAlive)
        ).subscribe(url => monitor(url));

        this.publicService.handleLogoutError(keepAlive);
    }

    protected initialModel(): void {
        this.language = this.publicService.getLanguage().pipe(
            map(lan => LanguageMap[lan])
        );

        this.username = this.publicService.getCurrentUser();
    }

    /**
     * @ignore
     */
    navigateTo(target: NavItem): void {
        if (!target.path.startsWith('http')) {
            this.router.navigate([target.path], { relativeTo: this.activatedRoute });
        } else {
            window.open(target.path);
        }
    }

    /**
     * @ignore
     */
    logout(): void {
        this.publicService.launchLogout(of(null));
    }
}


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent extends NavBaseComponent implements OnInit, OnDestroy {

    /**
     * Head navigation
     */
    navNavItems: NavItem[] = [main, square, factFinder, community, documentation, quoteChart, analyzing];

    /**
     * 搜索内容
     */
    searchValue: string;

    /**
     * 控制下拉菜单伸缩
     */
    isCollapsed = true;

    /**
     * @ignore
     */
    isBeforeLogin: Observable<boolean>;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public publicService: PublicService,
        public routing: RoutingService,
    ) {
        super(router, publicService, activatedRoute, routing);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        const monitor = (url: string) => this.navNavItems.forEach(item => item.selected = url.includes(item.path));

        this.initialModel();

        this.isBeforeLogin = this.publicService.isLogin().pipe(
            map(logged => !logged),
            distinctUntilChanged()
        );

        this.launch(() => this.isAlive, monitor);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
