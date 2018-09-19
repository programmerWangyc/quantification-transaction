import { Component, OnInit } from '@angular/core';

import { accountModules, agent, charge, exchange, message, NavItem, robot, strategy } from '../../base/base.config';
import { Breadcrumb } from '../../interfaces/app.interface';

interface Navigator extends NavItem { }

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {

    paths: Breadcrumb[] = [{ name: 'CONTROL_PANEL' }];

    list: Navigator[] = [
        robot,
        strategy,
        agent,
        exchange,
        charge,
        ...accountModules,
        message,
    ];

    constructor() { }

    ngOnInit() {
    }

}
