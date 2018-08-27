import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { filter, map, switchMapTo, take, takeWhile } from 'rxjs/operators';

import { Path } from '../app.config';
import { PublicService } from '../providers/public.service';
import { RoutingService } from '../providers/routing.service';

export interface SideNavItem {
    label: string;
    icon: string;
    path: string;
}

export interface SideNav extends SideNavItem {
    subNav?: SideNavItem[];
}

export const square: SideNav = {
    path: Path.square,
    label: 'STRATEGY_SQUARE',
    icon: 'shopping-cart',
};

export const factFinder: SideNav = {
    path: Path.fact,
    label: 'FACT_FINDER',
    icon: 'line-chart',
};

export const community: SideNav = {
    path: Path.community,
    label: 'COMMUNITY',
    icon: 'eye',
};

export const documentation: SideNav = {
    path: Path.doc,
    label: 'API_DOCUMENTATION',
    icon: 'folder-open',
};

export const controlCenterModules: SideNavItem[] = [
    { path: Path.robot, label: 'ROBOT', icon: 'android' },
    { path: Path.strategy, label: 'STRATEGY_LIBRARY', icon: 'chrome' },
    { path: Path.agent, label: 'AGENT', icon: 'apple' },
    { path: Path.exchange, label: 'EXCHANGE', icon: 'windows' },
];

const controlCenter: SideNav = {
    path: '',
    label: 'CONTROL_CENTER',
    icon: 'appstore',
    subNav: controlCenterModules,
};

export const charge: SideNav = {
    path: Path.charge,
    label: 'ACCOUNT_CHARGE',
    icon: 'pay-circle-o',
};

export const accountModules: SideNavItem[] = [
    { path: Path.account + '/' + Path.reset, label: 'MODIFY_PWD', icon: 'key' },
    { path: Path.account + '/' + Path.nickname, label: 'MODIFY_NICKNAME', icon: 'smile-o' },
    { path: Path.account + '/' + Path.wechat, label: 'BIND_WECHAT', icon: 'wechat' },
    { path: Path.account + '/' + Path.google, label: 'GOOGLE_VERIFY', icon: 'google' },
    { path: Path.account + '/' + Path.usergroup, label: 'SUBACCOUNT_GROUP', icon: 'usergroup-add' },
    { path: Path.account + '/' + Path.key, label: 'API_KEY', icon: 'key' },
    { path: Path.account + '/' + Path.warn, label: 'BALANCE_EARLY_WARNING', icon: 'bell' },
    { path: Path.account + '/' + Path.code, label: 'REGISTER_CODE', icon: 'tags-o' },
];

const account: SideNav = {
    path: '',
    label: 'ACCOUNT_MANAGEMENT',
    icon: 'setting',
    subNav: accountModules,
};

/**
 * !TODO：应该有一个接口能获取到消息的状态，否则用户不点消息中心时是看不到有没有消息过来的。
 * !除非一进来就拉那3个message接口。
 */
export const message: SideNav = {
    path: Path.message,
    label: 'MESSAGE_CENTER',
    icon: 'bell',
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
    list: SideNav[] = [controlCenter, square, factFinder, community, documentation, charge, account, message];

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
