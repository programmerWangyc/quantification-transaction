import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Strategy } from '../../interfaces/response.interface';

@Component({
    selector: 'app-strategy-list',
    templateUrl: './strategy-list.component.html',
    styleUrls: ['./strategy-list.component.scss']
})
export class StrategyListComponent implements OnInit {
    @Input() list: Strategy[] = [];

    tableHead: string[] = ['NAME', 'SHARE', 'CREATE_TIME', 'LATEST_MODIFY', 'OPERATE'];

    @Output() delete: EventEmitter<Strategy> = new EventEmitter();

    @Output() renewal: EventEmitter<Strategy> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
