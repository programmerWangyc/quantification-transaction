import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable, of } from 'rxjs';

import { Path } from '../app.config';
import { RoutingService } from '../providers/routing.service';
import { PublicService } from '../providers/public.service';
import { filter, takeWhile } from 'rxjs/operators';

export interface SideNavItem {
    label: string;
    icon: string;
    path: string;
}

export interface SideNav extends SideNavItem {
    subNav?: SideNavItem[];
}

const square: SideNav = {
    path: Path.square,
    label: 'STRATEGY_SQUARE',
    icon: 'shopping-cart',
};

const factFinder: SideNav = {
    path: Path.fact,
    label: 'FACT_FINDER',
    icon: 'line-chart',
};

const community: SideNav = {
    path: Path.community,
    label: 'COMMUNITY',
    icon: 'eye',
};

const documentation: SideNav = {
    path: Path.doc,
    label: 'API_DOCUMENTATION',
    icon: 'folder-open',
};

const controlCenter: SideNav = {
    path: '',
    label: 'CONTROL_CENTER',
    icon: 'appstore',
    subNav: [
        { path: Path.robot, label: 'ROBOT', icon: 'android' },
        { path: Path.strategy, label: 'STRATEGY_LIBRARY', icon: 'chrome' },
        { path: Path.agent, label: 'AGENT', icon: 'apple' },
        { path: Path.exchange, label: 'EXCHANGE', icon: 'windows' },
    ],
};

const charge: SideNav = {
    path: Path.charge,
    label: 'ACCOUNT_CHARGE',
    icon: 'pay-circle-o',
};

const account: SideNav = {
    path: '',
    label: 'ACCOUNT_MANAGEMENT',
    icon: 'setting',
    subNav: [
        { path: Path.account + '/' + Path.reset, label: 'MODIFY_PWD', icon: 'key' },
        { path: Path.account + '/' + Path.nickname, label: 'MODIFY_NICKNAME', icon: 'smile-o' },
        { path: Path.account + '/' + Path.wechat, label: 'BIND_WECHART', icon: 'wechat' },
        { path: Path.account + '/' + Path.google, label: 'GOOGLE_VERIFY', icon: 'google' },
        { path: Path.account + '/' + Path.usergroup, label: 'SUBACCOUNT_GROUP', icon: 'usergroup-add' },
    ],
};

/**
 * @deprecated 暂时不搞实盘仿真
 */
// const simulation: SideNav = {
//     label: 'FIRMWARE_SIMULATION',
//     path: Path.simulation,
//     icon: 'meh-o',
// };

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
    list: SideNav[] = [controlCenter, square, factFinder, community, documentation, charge, account];

    /**
     * 当前展示的模块
     */
    currentModule: string;

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * @ignore
     */
    username: Observable<string>;

    /**
     * @ignore
     */
    isAlive = true;

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
        this.subscription$$ = this.routing.getCurrentUrl()
            .subscribe(url => {
                const ary = url.split('/'); // ary : ['', 'dashboard', moduleName, ...params etc.]

                this.currentModule = ary[2];
            });

        this.username = this.publicService.getCurrentUser();

        this.publicService.handleLogoutError(() => this.isAlive);

        this.publicService.isLogoutSuccess().pipe(
            filter(success => success),
            takeWhile(() => this.isAlive)
        ).subscribe(_ => this.router.navigate(['home'], { relativeTo: this.activatedRoute.root }));

        this.publicService.getError().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(error => error === 'Need Login' && this.router.navigate(['auth', 'login'], { relativeTo: this.activatedRoute.root}));
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
        return source.subNav.map(item => item.path).includes(this.currentModule);
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
        this.subscription$$.unsubscribe();

        this.isAlive = false;

        this.publicService.clearLogoutInfo();
    }
}
