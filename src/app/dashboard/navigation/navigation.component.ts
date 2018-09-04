import { Component, OnInit } from '@angular/core';

import {
    accountModules, agent, charge, community, documentation, exchange, factFinder, message, NavItem, robot, square,
    strategy
} from '../../base/base.config';

interface Navigator extends NavItem { }

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {

    list: Navigator[] = [
        robot,
        strategy,
        agent,
        exchange,
        square,
        factFinder,
        community,
        documentation,
        charge,
        ...accountModules,
        message,
    ];

    constructor() { }

    ngOnInit() {
    }

}
