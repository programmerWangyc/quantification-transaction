import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { PublicService } from '../../providers/public.service';

@Component({
    selector: 'app-account-balance',
    templateUrl: './account-balance.component.html',
    styleUrls: ['./account-balance.component.scss'],
})
export class AccountBalanceComponent implements OnInit {

    balance: Observable<number>;

    consumed: Observable<number>;

    unit = 'YUAN';

    constructor(
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.balance = this.publicService.getBalance();

        this.consumed = this.publicService.getConsumed();
    }
}
