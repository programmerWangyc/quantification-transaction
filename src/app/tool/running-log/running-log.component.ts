import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { from as observableFrom } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

import { RunningLog } from '../../interfaces/response.interface';
import { PAGE_SIZE_SELECT_VALUES } from '../../providers/constant.service';
import { LogTypes } from '../tool.config';

export interface FilterType {
    text: string;
    value: number;
}

export const filterTypes: FilterType[] = [
    { text: LogTypes[0], value: LogTypes.BUY },
    { text: LogTypes[1], value: LogTypes.SALE },
    { text: LogTypes[2], value: LogTypes.RETRACT },
    { text: LogTypes[3], value: LogTypes.ERROR },
    { text: LogTypes[4], value: LogTypes.PROFIT },
    { text: LogTypes[5], value: LogTypes.MESSAGE },
    { text: LogTypes[6], value: LogTypes.RESTART },
];
@Component({
    selector: 'app-running-log',
    templateUrl: './running-log.component.html',
    styleUrls: ['./running-log.component.scss'],
})
export class RunningLogComponent implements OnInit {
    filterTypes = [];

    /**
     * 可选择的每页展示的策略数目
     */
    pageSizeSelectorValues = PAGE_SIZE_SELECT_VALUES;

    /**
     * 当前页码
     */
    currentPage = 1;

    @Input() logs: RunningLog[];

    @Input() statistics: string;

    @Input() logTotal: number;

    @Input() pageSize: number;

    @Output() pageChange: EventEmitter<number> = new EventEmitter();

    @Output() search: EventEmitter<number[]> = new EventEmitter();

    @Output() pageSizeChange: EventEmitter<number> = new EventEmitter();

    constructor(private translate: TranslateService) {
        observableFrom(filterTypes).pipe(
            mergeMap(type => this.translate.get(type.text).pipe(
                map(text => ({ text, value: type.value }))
            )),
            reduce((acc: FilterType[], cur: FilterType) => [...acc, cur], [])
        ).subscribe(types => this.filterTypes = types);
    }

    ngOnInit() {
        this.search.next([]);
    }
}
