import { Component, OnInit } from '@angular/core';

import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ABOUT_US' }];

    about: string[] = [
        'COMPANY_INTRODUCE_P1',
        'COMPANY_INTRODUCE_P2',
        'COMPANY_INTRODUCE_P3',
    ];

    contact: string[] = [
        'COMPANY_INFO_P1',
        'COMPANY_INFO_P2',
        'COMPANY_INFO_P3',
        'COMPANY_INFO_P4',
        'COMPANY_INFO_P5',
    ];

    constructor() { }

    ngOnInit() {

    }
}
