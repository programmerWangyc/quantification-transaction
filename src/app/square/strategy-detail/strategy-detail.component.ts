import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-strategy-detail',
    templateUrl: './strategy-detail.component.html',
    styleUrls: ['./strategy-detail.component.scss'],
})
export class StrategyDetailComponent implements OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_SQUARE', path: '../../' }, { name: 'STRATEGY_DETAIL' }];

    constructor() { }

    ngOnInit() {
    }

}
