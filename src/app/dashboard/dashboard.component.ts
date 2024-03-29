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
import { Observable } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends NavBaseComponent implements OnInit, OnDestroy {

    isCollapsed = false;

    sideNav: SideNav[] = [robot, strategy, agent, exchange, charge, account, message];

    headNav: SideNav[] = [square, factFinder, community, documentation, quoteChart, analyzing];

    messageCount: Observable<number>;

    isAlive = true;

    constructor(
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public routing: RoutingService,
        public publicService: PublicService,
    ) {
        super(router, publicService, activatedRoute, routing);
    }

    ngOnInit() {
        this.initialModel();

        this.privateInitialModel();

        this.launch(() => this.isAlive, this.checkActivatedModule);

        this.privateLaunch();
    }

    privateInitialModel() {
        this.messageCount = this.publicService.getNotify();
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

    ngOnDestroy() {
        this.isAlive = false;
    }
}
