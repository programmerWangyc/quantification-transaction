import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Path } from '../../app.config';

export interface Link {
    path: string;
    label: string;
}

const main: Link = {
    path: Path.home,
    label: 'HOME',
};

const square: Link = {
    path: Path.square,
    label: 'STRATEGY_SQUARE',
};

const factFinder: Link = {
    path: Path.fact,
    label: 'FACT_FINDER',
};

const community: Link = {
    path: Path.community,
    label: 'COMMUNITY',
};

const documentation: Link = {
    path: Path.doc,
    label: 'API_DOCUMENTATION',
};

const quoteChart: Link = {
    path: 'https://quant.la/Tools/View/4/chart.html',
    label: 'QUOTE_CHART',
};

const analyzing: Link = {
    path: 'https://quant.la/Tools/View/3/formula.html',
    label: 'ANALYZING_TOOL',
};

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

    /**
     * Head navigation
     */
    navLinks: Link[] = [main, square, factFinder, community, documentation, quoteChart, analyzing];

    /**
     * 搜索内容
     */
    searchValue: string;

    /**
     * 控制下拉菜单伸缩
     */
    isCollapsed = true;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
    navigateTo(target: Link): void {
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
