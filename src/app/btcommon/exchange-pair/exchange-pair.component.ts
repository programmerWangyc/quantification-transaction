import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SelectedPair } from '../../interfaces/constant.interface';

@Component({
    selector: 'app-exchange-pair',
    templateUrl: './exchange-pair.component.html',
    styleUrls: ['./exchange-pair.component.scss']
})
export class ExchangePairComponent implements OnInit {
    @Input() pairs: SelectedPair[] = [];

    @Output() remove: EventEmitter<number> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
