import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { SelectedPair } from '../../interfaces/app.interface';

@Component({
    selector: 'app-exchange-pair',
    templateUrl: './exchange-pair.component.html',
    styleUrls: ['./exchange-pair.component.scss'],
})
export class ExchangePairComponent implements OnInit {

    /**
     * 交易对
     */
    @Input() pairs: SelectedPair[] = [];

    /**
     * 删除交易对，发送要删除的交易对序号
     */
    @Output() remove: EventEmitter<number> = new EventEmitter();

    constructor() { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

}
