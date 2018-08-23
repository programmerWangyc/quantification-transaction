import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'ACCOUNT_MANAGEMENT' }];

    constructor() { }

    ngOnInit() {
    }

}
