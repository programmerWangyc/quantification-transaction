import { Component, OnInit } from '@angular/core';

import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-exchange-add',
    templateUrl: './exchange-add.component.html',
    styleUrls: ['./exchange-add.component.scss'],
})
export class ExchangeAddComponent implements OnInit {

    paths: Breadcrumb[] = [ { name: 'EXCHANGE', path: '../' }, { name: 'ADD' }];

    constructor(
    ) {
    }

    /**
     * @ignore
     */
    ngOnInit() {
    }
}
