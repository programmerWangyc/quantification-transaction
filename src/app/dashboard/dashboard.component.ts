import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { filter, map, switchMapTo, take, takeWhile } from 'rxjs/operators';

import {
    account, charge, community, controlCenter, documentation, factFinder, message, SideNav, square, NavItem, analyzing, quoteChart
} from '../base/base.config';
import { PublicService } from '../providers/public.service';
import { RoutingService } from '../providers/routing.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

    /**
     * 侧边栏是否处于折叠状态
     */
    isCollapsed = false;

    /**
     * 侧边栏列表
     */
    list: SideNav[] = [controlCenter, square, factFinder, community, documentation, charge, account, message];

    /**
     * @ignore
     */
    toolMenu: NavItem[] = [quoteChart, analyzing];

    /**
     * 当前展示的模块
     */
    private currentModule: string;

    /**
     * @ignore
     */
    private currentPath: string;

    /**
     * @ignore
     */
    username: Observable<string>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    language: Observable<string>;

    /**
     * @ignore
     */
    changeLanguage$: Subject<boolean> = new Subject();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private routing: RoutingService,
        private publicService: PublicService,
    ) {
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    initialModel(): void {
        this.username = this.publicService.getCurrentUser();

        this.language = this.publicService.getLanguage().pipe(
            map(lan => lan === 'zh' ? 'SIMPLE_CHINESE' : 'ENGLISH')
        );
    }

    launch(): void {
        const keepAlive = () => this.isAlive;

        this.routing.getCurrentUrl().pipe(
            takeWhile(keepAlive)
        ).subscribe(url => {
            const ary = url.split('/'); // ary : ['', 'dashboard', moduleName or moduleName / path, ...params etc.]

            this.currentPath = url;

            this.currentModule = ary[2];
        });

        this.publicService.handleLogoutError(keepAlive);

        this.publicService.isLogoutSuccess().pipe(
            filter(success => success),
            takeWhile(keepAlive)
        ).subscribe(_ => this.router.navigate(['home'], { relativeTo: this.activatedRoute.root }));

        this.publicService.getError().pipe(
            takeWhile(keepAlive)
        ).subscribe(error => error === 'Need Login' && this.router.navigate(['auth', 'login'], { relativeTo: this.activatedRoute.root }));

        this.publicService.updateLanguage(this.changeLanguage$.pipe(
            switchMapTo(this.language.pipe(
                take(1),
                map(lan => lan === 'SIMPLE_CHINESE' ? 'en' : 'zh')
            ))
        ));
    }

    /**
     * @ignore
     */
    navigateTo(target: SideNav): void {
        if (!target.path.startsWith('http')) {
            this.router.navigate([target.path], { relativeTo: this.activatedRoute });
        } else {
            window.open(target.path);
        }
    }

    /**
     * 模块是否处于激活状态
     */
    isActive(source: SideNav): boolean {
        return source.subNav.map(item => item.path.includes('/') ? item.path.split('/')[0] : item.path).includes(this.currentModule);
    }

    /**
     * @ignore
     */
    isPath(path: string): boolean {
        const subPath = path.includes('/') ? path.split('/')[1] : path;

        return this.currentPath.includes(subPath);
    }

    /**
     * 退出
     */
    logout(): void {
        this.publicService.launchLogout(of(null));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.publicService.clearLogoutInfo();
    }
}
