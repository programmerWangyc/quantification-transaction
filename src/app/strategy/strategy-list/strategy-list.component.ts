import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Path } from '../../app.config';
import { StrategyShareType } from '../../interfaces/request.interface';
import { Strategy, StrategyPublicState } from '../../interfaces/response.interface';
import { ShareStrategyStateSnapshot } from '../strategy.interface';
import { TableStatistics } from '../../interfaces/app.interface';
import { getTableStatistics } from '../../base/base.service';

@Component({
    selector: 'app-strategy-list',
    templateUrl: './strategy-list.component.html',
    styleUrls: ['./strategy-list.component.scss'],
})
export class StrategyListComponent implements OnInit {




    @Input() set list(input: Strategy[]) {
        if (!!input) {
            this._list = input;

            this.statisticsParams = getTableStatistics(input.length, this.pageSize);
        }
    }

    private _list: Strategy[] = [];

    get list(): Strategy[] {
        return this._list;
    }

    statisticsParams: TableStatistics = { total: 0, page: 0 };




    @Output() delete: EventEmitter<Strategy> = new EventEmitter();




    @Output() renewal: EventEmitter<Strategy> = new EventEmitter();




    @Output() share: EventEmitter<ShareStrategyStateSnapshot> = new EventEmitter();




    pageSize = 20;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }




    ngOnInit() {
    }




    navigateTo(strategy: Strategy): void {
        if (strategy.is_owner) {
            this.router.navigate([Path.edit, strategy.id], { relativeTo: this.activatedRoute });
        } else {
            if (strategy.public === StrategyPublicState.UNDISCLOSED || strategy.public === StrategyPublicState.DISCLOSED) {
                this.router.navigate([Path.backtest, strategy.id], { relativeTo: this.activatedRoute });
            } else {
                this.router.navigate([strategy.id, strategy.name], { relativeTo: this.activatedRoute });
            }
        }
    }




    publish(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.PUBLISH, currentType: strategy.public });
    }




    sell(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.SELL, currentType: strategy.public });
    }




    cancel(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.CANCEL_PUBLISH, currentType: strategy.public });
    }

    genKey(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.PUBLISH, currentType: strategy.public});
    }
}
