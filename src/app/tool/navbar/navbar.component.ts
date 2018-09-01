import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
    analyzing, community, documentation, factFinder, main, NavItem, quoteChart, square
} from '../../base/base.config';
import { Observable, Subject, of } from 'rxjs';
import { PublicService } from '../../providers/public.service';
import { map, takeWhile, take } from 'rxjs/operators';
import { LanguageMap } from '../../app.config';
import { RoutingService } from '../../providers/routing.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    animations: [
        trigger('moduleState', [
            state('inactive', style({
                opacity: 0,
            })),
            state('active', style({
                opacity: 1,
            })),
            transition('inactive => active', animate('300ms ease-in')),
            transition('active => inactive', animate('300ms ease-out')),
        ]),
    ],
})
export class NavbarComponent implements OnInit, OnDestroy {

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
    language$: Subject<string> = new Subject();

    /**
     * @ignore
     */
    language: Observable<string>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    username: Observable<string>;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private publicService: PublicService,
        private routing: RoutingService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    initialModel(): void {
        this.isBeforeLogin = this.publicService.isLogin().pipe(
            map(logged => !logged)
        );

        this.language = this.publicService.getLanguage().pipe(
            map(lan => LanguageMap[lan])
        );

        this.username = this.publicService.getCurrentUser();
    }

    /**
     * @ignore
     */
    launch(): void {
        this.publicService.updateLanguage(this.language$.asObservable().pipe(
            takeWhile(() => this.isAlive)
        ));

        this.routing.getCurrentUrl().pipe(
            take(1)
        ).subscribe(url => this.navNavItems.forEach(item => item.selected = url.includes(item.path)));
    }

    /**
     * @ignore
     */
    navigateTo(target: NavItem): void {
        this.updateIndicator(target);

        if (!target.path.startsWith('http')) {
            this.router.navigate([target.path], { relativeTo: this.activatedRoute });
        } else {
            window.open(target.path);
        }
    }

    private updateIndicator(target: NavItem): void {
        this.navNavItems.forEach(item => item.selected = item === target);
    }

    /**
     * @ignore
     */
    logout(): void {
        this.publicService.launchLogout(of(null));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
