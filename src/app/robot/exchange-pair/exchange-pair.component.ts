import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { SelectedPair } from '../../interfaces/app.interface';

@Component({
    selector: 'app-exchange-pair',
    templateUrl: './exchange-pair.component.html',
    styleUrls: ['./exchange-pair.component.scss'],
})
export class ExchangePairComponent implements OnInit {
    @Input() pairs: SelectedPair[] = [];

    @Output() remove: EventEmitter<number> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
