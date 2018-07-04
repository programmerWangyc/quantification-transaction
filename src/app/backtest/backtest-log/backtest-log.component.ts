import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

export interface BacktestTaskLog {
    period: number;
    trade: number;

}

@Component({
    selector: 'app-backtest-log',
    templateUrl: './backtest-log.component.html',
    styleUrls: ['./backtest-log.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BacktestLogComponent implements OnInit {
    logs: Observable<any[]>;

    cols: Observable<string[]>;

    values: Observable<number[]>;

    constructor() { }

    ngOnInit() {

    }

}
