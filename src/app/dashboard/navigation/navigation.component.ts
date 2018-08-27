import { Component, OnInit } from '@angular/core';
import { SideNavItem, controlCenterModules, square, factFinder, community, documentation, charge, accountModules, message } from '../dashboard.component';

interface Navigator extends SideNavItem { }

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
