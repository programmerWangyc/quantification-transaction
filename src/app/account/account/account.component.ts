import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';
import { SideNavItem, accountModules } from '../../dashboard/dashboard.component';
import { Path } from '../../app.config';

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

    navigators: SideNavItem[] = accountModules.map(item => ({ ...item, path: item.path.replace(Path.account, '.') }));

    constructor() { }

    ngOnInit() {
    }

}
