import { Component, OnInit } from '@angular/core';

export interface Link {
    path: string;
    label: string;
}

const main: Link = {
    path: 'home',
    label: 'HOME',
}

const square: Link = {
    path: 'square',
    label: 'STRATEGY_SQUARE',
}

const factFinder: Link = {
    path: 'fact',
    label: 'FACT_FINDER',
}

const community: Link = {
    path: 'community',
    label: 'COMMUNITY',
}

const documentation: Link = {
    path: 'doc',
    label: 'API_DOCUMENTATION',
}

const market: Link = {
    path: '',
    label: 'QUOTE_TOOL'
}

const analyzing: Link = {
    path: '',
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

    constructor() { }

    ngOnInit() {
    }

    onSearch(event: string): void {
        console.log(event);
    }
}
