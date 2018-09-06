import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { SideNav } from '../../base/base.config';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.scss'],
    animations: [
        trigger('moduleState', [
            state('inactive', style({
                opacity: 0,
            })),
            state('active', style({
                opacity: 1,
            })),
            transition('inactive => active', animate('300ms ease-in')),
            transition('active => inactive', animate('300ms ease-out')),
        ]),
    ],
})
export class NavMenuComponent implements OnInit {
    @Input() links: SideNav[];

    @Output() navigate: EventEmitter<SideNav> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
