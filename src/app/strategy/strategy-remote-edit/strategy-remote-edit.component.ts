import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface Panel {
    name: string;
    active: boolean;
}

@Component({
    selector: 'app-strategy-remote-edit',
    templateUrl: './strategy-remote-edit.component.html',
    styleUrls: ['./strategy-remote-edit.component.scss'],
})
export class StrategyRemoteEditComponent implements OnInit {

    /**
     * 操作密钥
     */
    @Input() key = '';

    /**
     * 密钥操作，增，删，改，查；
     */
    @Output() operateToken: EventEmitter<number> = new EventEmitter();

    /**
     * @ignore
     */
    panel: Panel = { name: 'REMOTE_EDIT', active: false };

    constructor() { }

    /**
     * @ignore
     */
    ngOnInit() {
    }
}
