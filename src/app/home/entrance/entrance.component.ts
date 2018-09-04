import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { community, documentation, factFinder, quoteChart, SideNav, square } from '../../base/base.config';

interface Entrance extends SideNav {
    description: string;
    backgroundImag: string;
}

@Component({
    selector: 'app-entrance',
    templateUrl: './entrance.component.html',
    styleUrls: ['./entrance.component.scss'],
    animations: [
        trigger('inOut', [
            state('inactive', style({
                transform: 'scale(1)',
                boxShadow: 'none',
                zIndex: 1,
            })),
            state('active', style({
                transform: 'scale(1.3)',
                boxShadow: '0px 0px 15px 1px #505050',
                zIndex: 999,
            })),
            transition('inactive => active', animate('300ms ease-in')),
            transition('active => inactive', animate('300ms ease-out')),
        ]),
    ],
})
export class EntranceComponent implements OnInit {

    list: Entrance[] = [
        {
            ...square,
            description: 'STRATEGY_SUBTITLE',
            backgroundImag: '../../../assets/images/home/square_bcg.png',
        },
        {
            ...factFinder,
            description: 'STRATEGY_SUBTITLE',
            backgroundImag: '../../../assets/images/home/fact_bcg.png',
        },
        {
            ...community,
            description: 'STRATEGY_SUBTITLE',
            backgroundImag: '../../../assets/images/home/community_bcg.png',
        },
        {
            ...documentation,
            description: 'STRATEGY_SUBTITLE',
            backgroundImag: '../../../assets/images/home/document_bcg.png',
        },
        {
            ...quoteChart,
            description: 'STRATEGY_SUBTITLE',
            backgroundImag: '../../../assets/images/home/tools_bcg.png',
        },
    ];

    constructor(
        private router: Router,
    ) { }

    ngOnInit() {
    }

    navigateTo(target: Entrance): void {
        if (!target.path.startsWith('http')) {
            this.router.navigate([target.path]);
        } else {
            window.open(target.path);
        }
    }
}
