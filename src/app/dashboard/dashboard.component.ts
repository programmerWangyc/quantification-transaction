import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Path } from '../app.config';
import { RoutingService } from '../providers/routing.service';

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
}

const factFinder: SideNav = {
    path: Path.fact,
    label: 'FACT_FINDER',
    icon: 'line-chart'
}

const community: SideNav = {
    path: Path.community,
    label: 'COMMUNITY',
    icon: 'eye'
}

const documentation: SideNav = {
    path: Path.doc,
    label: 'API_DOCUMENTATION',
    icon: 'folder-open',
}

const market: SideNav = {
    path: Path.market,
    label: 'QUOTE_TOOL',
    icon: 'bars',
}

const analyzing: SideNav = {
    path: Path.analyze,
    label: 'ANALYZING_TOOL',
    icon: 'tool',
    subNav: [
        { path: '', label: 'QUOTE_TOOL', icon: 'area-chart' },
        { path: '', label: 'ANALYZING_TOOL', icon: 'edit' },
    ]
}

const controlCenter: SideNav = {
    path: '',
    label: 'CONTROL_CENTER',
    icon: 'appstore',
    subNav: [
        { path: Path.robot, label: 'ROBOT', icon: 'android' },
        { path: Path.strategy, label: 'STRATEGY_LIBRARY', icon: 'chrome' },
        { path: Path.trustee, label: 'TRUSTEE', icon: 'apple' },
        { path: Path.exchange, label: 'EXCHANGE', icon: 'windows' },
    ]
}

const simulation: SideNav = {
    label: 'FIRMWARE_SIMULATION',
    path: Path.simulate,
    icon: 'meh-o',
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    isCollapsed = false;

    searchValue: string;

    list: SideNav[] = [controlCenter, simulation, square, factFinder, community, documentation, market, analyzing];

    currentModule: string;

    subscription$$: Subscription;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private routing: RoutingService,
    ) {
    }

    ngOnInit() {
        this.subscription$$ = this.routing.getCurrentUrl().subscribe(url => {
            const ary = url.split('/'); // ary : ['', 'dashboard', moduleName, ...params etc.]

            this.currentModule = ary[2];
        });
    }

    navigateTo(target: SideNav): void {
        this.router.navigate([target.path], { relativeTo: this.activatedRoute });
    }

    isActive(source: SideNav): boolean {
        const paths = source.subNav.map(item => item.path);

        return paths.indexOf(this.currentModule) !== -1;
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }

}
