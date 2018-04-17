import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Path } from '../../interfaces/constant.interface';
import { PublicService } from './../../providers/public.service';

export interface Link {
    path: string;
    label: string;
}

const main: Link = {
    path: Path.home,
    label: 'HOME',
}

const square: Link = {
    path: Path.square,
    label: 'STRATEGY_SQUARE',
}

const factFinder: Link = {
    path: Path.fact,
    label: 'FACT_FINDER',
}

const community: Link = {
    path: Path.community,
    label: 'COMMUNITY',
}

const documentation: Link = {
    path: Path.doc,
    label: 'API_DOCUMENTATION',
}

const market: Link = {
    path: Path.market,
    label: 'QUOTE_TOOL'
}

const analyzing: Link = {
    path: Path.analyze,
    label: 'ANALYZING_TOOL',
}

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    navLinks: Link[] = [main, square, factFinder, community, documentation, market, analyzing ];

    searchValue: string;

    isCollapsed = true;
    
    isLogin: Observable<boolean>

    constructor(
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.isLogin = this.publicService.isLogin();
    }

    onSearch(event: string): void {
        console.log(event);
    }
}
