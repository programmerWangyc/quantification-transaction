import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
    analyzing, community, documentation, factFinder, main, NavItem, quoteChart, square
} from '../../base/base.config';
import { Observable } from 'rxjs';
import { PublicService } from '../../providers/public.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

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

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private publicService: PublicService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.isBeforeLogin = this.publicService.isLogin().pipe(
            map(logged => !logged)
        );
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
    onSearch(event: string): void {
        console.log(event);
    }
}
