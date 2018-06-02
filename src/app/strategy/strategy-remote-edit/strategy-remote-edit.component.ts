import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface Panel {
    name: string;
    active: boolean;
}

@Component({
    selector: 'app-strategy-remote-edit',
    templateUrl: './strategy-remote-edit.component.html',
    styleUrls: ['./strategy-remote-edit.component.scss']
})
export class StrategyRemoteEditComponent implements OnInit {

    @Input() key = '';

    @Output() operateToken: EventEmitter<number> = new EventEmitter();

    panel: Panel = { name: 'REMOTE_EDIT', active: false };

    constructor() { }

    ngOnInit() {
    }
}
