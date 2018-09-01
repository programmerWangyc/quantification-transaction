import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { filter, map, switchMapTo, take, takeWhile } from 'rxjs/operators';

import {
    account, analyzing, charge, community, controlCenter, documentation, factFinder, message, NavItem, quoteChart,
    SideNav, square
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
        ).subscribe(path => this.checkActivatedModule(path));

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
     * @ignore
     */
    private isActive(path: string, currentPath: string): boolean {
        const subPath = path.includes('/') ? path.split('/')[1] : path;

        return currentPath.includes(subPath);
    }

    /**
     * @ignore
     */
    private checkActivatedModule(currentPath: string): void {
        this.list.forEach(group => {
            if (group.subNav) {
                group.subNav.forEach(item => item.selected = this.isActive(item.path, currentPath));

                group.selected = group.subNav.some(item => item.selected);
            } else {
                group.selected = this.isActive(group.path, currentPath);
            }
        });
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
