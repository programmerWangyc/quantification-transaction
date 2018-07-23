import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Path } from '../../app.config';
import { StrategyShareType } from '../../interfaces/request.interface';
import { Strategy, StrategyPublicState } from '../../interfaces/response.interface';
import { ShareStrategyStateSnapshot } from '../strategy.interface';

@Component({
    selector: 'app-strategy-list',
    templateUrl: './strategy-list.component.html',
    styleUrls: ['./strategy-list.component.scss']
})
export class StrategyListComponent implements OnInit {
    /**
     * @ignore
     */
    tableHead: string[] = ['NAME', 'SHARE', 'CREATE_TIME', 'LATEST_MODIFY', 'OPERATE'];

    /**
     * Strategy list
     */
    @Input() list: Strategy[] = [];

    /**
     * 删除
     */
    @Output() delete: EventEmitter<Strategy> = new EventEmitter();

    /**
     * 续费
     */
    @Output() renewal: EventEmitter<Strategy> = new EventEmitter();

    /**
     * 分享
     */
    @Output() share: EventEmitter<ShareStrategyStateSnapshot> = new EventEmitter();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
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

    /**
     * 公开策略
     */
    publish(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.PUBLISH, currentType: strategy.public });
    }

    /**
     * 出售策略
     */
    sell(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.SELL, currentType: strategy.public });
    }

    /**
     * 取消公开
     */
    cancel(strategy: Strategy): void {
        this.share.next({ id: strategy.id, type: StrategyShareType.CANCEL_PUBLISH, currentType: strategy.public });
    }

    /**
     * TODO:
     */
    createKey(strategy: Strategy): void {

    }

}
