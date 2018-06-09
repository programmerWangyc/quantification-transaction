import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Category, StrategyConstantService, SupportedLanguage } from '../providers/strategy.constant.service';
import { Strategy } from '../../interfaces/response.interface';

@Component({
    selector: 'app-strategy-des',
    templateUrl: './strategy-des.component.html',
    styleUrls: ['./strategy-des.component.scss']
})
export class StrategyDesComponent implements OnInit {
    @Input() set strategy(value: Strategy) {
        if (!value) return;

        this._strategy = value;

        this.strategyName = value.name + '(copy)';
    }

    @Output() langChange: EventEmitter<number> = new EventEmitter();

    @Output() catChange: EventEmitter<number> = new EventEmitter();

    @Output() nameUpdate: EventEmitter<string> = new EventEmitter();

    strategyName = '';

    language = 0;

    category = 0;

    languages: SupportedLanguage[] = [];

    categories: Category[] = [];

    private _strategy: Strategy;

    constructor(
        private constant: StrategyConstantService,
    ) { }

    ngOnInit() {
        this.categories = this.constant.STRATEGY_CATEGORIES.slice(0, -1);

        this.languages = this.constant.SUPPORTED_LANGUAGE;
    }
}
