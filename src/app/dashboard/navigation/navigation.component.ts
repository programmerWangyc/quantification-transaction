import { Component, OnInit } from '@angular/core';
import { NavItem, controlCenterModules, square, factFinder, community, documentation, charge, accountModules, message } from '../../base/base.config';

interface Navigator extends NavItem { }

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {

    list: Navigator[] = [
        ...controlCenterModules,
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
