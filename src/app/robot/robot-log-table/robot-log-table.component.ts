import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

import { LogTypes } from '../../interfaces/constant.interface';
import { RunningLog } from '../../interfaces/response.interface';
import { PAGE_SIZE_SELECT_VALUES } from '../../providers/constant.service';

export interface FilterType {
    text: string;
    value: number;
}

export const filterTypes: FilterType[] = [
    { text: LogTypes[0], value: LogTypes.BUY, },
    { text: LogTypes[1], value: LogTypes.SALE, },
    { text: LogTypes[2], value: LogTypes.RETRACT, },
    { text: LogTypes[3], value: LogTypes.ERROR, },
    { text: LogTypes[4], value: LogTypes.PROFIT, },
    { text: LogTypes[5], value: LogTypes.MESSAGE, },
    { text: LogTypes[6], value: LogTypes.RESTART, },
];
@Component({

    selector: 'app-robot-log-table',
    templateUrl: './robot-log-table.component.html',
    styleUrls: ['./robot-log-table.component.scss']
})
export class RobotLogTableComponent implements OnInit {
    filterTypes = [];

    pageSizeSelectorValues = PAGE_SIZE_SELECT_VALUES;

    currentPage = 1;

    @Input() logs: RunningLog[];

    @Input() statistics: string;

    @Input() logTotal: number;

    @Input() pageSize: number;

    @Output() pageChange: EventEmitter<number> = new EventEmitter();

    @Output() search: EventEmitter<number[]> = new EventEmitter();

    @Output() pageSizeChange: EventEmitter<number> = new EventEmitter();

    constructor(private translate: TranslateService) {
        Observable.from(filterTypes)
            .mergeMap(type => this.translate.get(type.text).map(text => ({ text, value: type.value })))
            .reduce((acc, cur) => [...acc, cur], [])
            .subscribe(types => this.filterTypes = types);
    }

    ngOnInit() {
        this.search.next([]);
    }
}
