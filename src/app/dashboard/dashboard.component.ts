import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, takeWhile } from 'rxjs/operators';

import {
    account, agent, analyzing, charge, community, documentation, exchange, factFinder, message, quoteChart, robot,
    SideNav, square, strategy
} from '../base/base.config';
import { PublicService } from '../providers/public.service';
import { RoutingService } from '../providers/routing.service';
import { NavBaseComponent } from '../tool/navbar/navbar.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends NavBaseComponent implements OnInit, OnDestroy {

    /**
     * 侧边栏是否处于折叠状态
     */
    isCollapsed = false;

    /**
     * 侧边栏列表
     */
    sideNav: SideNav[] = [robot, strategy, agent, exchange, charge, account, message];

    /**
     * @ignore
     */
    headNav: SideNav[] = [square, factFinder, community, documentation, quoteChart, analyzing];

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public routing: RoutingService,
        public publicService: PublicService,
    ) {
        super(router, publicService, activatedRoute, routing);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch(() => this.isAlive, this.checkActivatedModule);

        this.privateLaunch();
    }

    privateLaunch(): void {
        const keepAlive = () => this.isAlive;

        this.publicService.isLogoutSuccess().pipe(
            filter(success => success),
            takeWhile(keepAlive)
        ).subscribe(_ => this.router.navigate(['home'], { relativeTo: this.activatedRoute.root }));

        this.publicService.getError().pipe(
            takeWhile(keepAlive)
        ).subscribe(error => error === 'Need Login' && this.router.navigate(['auth', 'login'], { relativeTo: this.activatedRoute.root }));
    }

    /**
     * @ignore
     */
    checkActivatedModule = (url: string): void => {
        const isActive = (path: string, currentPath: string): boolean => {
            if (path.startsWith('http')) {
                return false;
            }

            const subPath = path.includes('/') ? path.split('/')[1] : path;

            return currentPath.includes(subPath);
        };

        const check = group => {
            if (group.subNav) {
                group.subNav.forEach(item => item.selected = isActive(item.path, url));

                group.selected = group.subNav.some(item => item.selected);
            } else {
                group.selected = isActive(group.path, url);
            }
        };

        this.sideNav.forEach(check);

        this.headNav.forEach(check);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
