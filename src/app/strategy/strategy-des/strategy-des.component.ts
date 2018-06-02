import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Category, StrategyConstantService, SupportedLanguage } from '../providers/strategy.constant.service';

@Component({
    selector: 'app-strategy-des',
    templateUrl: './strategy-des.component.html',
    styleUrls: ['./strategy-des.component.scss']
})
export class StrategyDesComponent implements OnInit {
    @Input() set name(value) {
        this.strategyName = value + '(copy)';
    }

    strategyName = '';

    @Input() language = 0;

    @Input() category = 0;

    @Output() langChange: EventEmitter<number> = new EventEmitter();

    @Output() catChange: EventEmitter<number> = new EventEmitter();

    @Output() nameUpdate: EventEmitter<string> = new EventEmitter();

    languages: SupportedLanguage[] = [];

    categories: Category[] = [];

    constructor(
        private constant: StrategyConstantService,
    ) { }

    ngOnInit() {
        this.categories = this.constant.STRATEGY_CATEGORIES;

        this.languages = this.constant.SUPPORTED_LANGUAGE;
    }
}
