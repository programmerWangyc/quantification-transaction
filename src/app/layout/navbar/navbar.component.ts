import { Component, OnInit } from '@angular/core';

export interface Link {
    path: string;
    label: string;
    icon: string;
}

const main: Link = {
    path: 'home',
    label: 'HOME',
    icon: 'home',
}

const square: Link = {
    path: 'square',
    label: 'STRATEGY_SQUARE',
    icon: 'shopping cart',
}

const factFinder: Link = {
    path: 'fact',
    label: 'FACT_FINDER',
    icon: 'play_circle_filled',
}

const community: Link = {
    path: 'community',
    label: 'COMMUNITY',
    icon: 'chat',
}

const documentation: Link = {
    path: 'doc',
    label: 'API_DOCUMENTATION',
    icon: 'folder',
}

const tools: Link = {
    path: 'tools',
    label: 'TOOLS',
    icon: 'work'
}

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    navLinks: Link[] = [main, square, factFinder, community, documentation];

    constructor() { }

    ngOnInit() {
    }

}
