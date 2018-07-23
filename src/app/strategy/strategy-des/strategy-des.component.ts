import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';

import { CategoryType } from '../../interfaces/request.interface';
import { Strategy } from '../../interfaces/response.interface';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { Category, StrategyConstantService, SupportedLanguage } from '../providers/strategy.constant.service';
import { StrategyService } from '../providers/strategy.service';

@Component({
    selector: 'app-strategy-des',
    templateUrl: './strategy-des.component.html',
    styleUrls: ['./strategy-des.component.scss']
})
export class StrategyDesComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() set strategy(value: Strategy) {
        if (!value) return;

        this._strategy = value;

        this.strategyName = value.name + '(copy)';

        this.language = value.language;

        this.category = value.category;

        this.strategyService.updateSelectedLanguage(this.language);
    }

    /**
     * Update language;
     */
    @Output() langChange: EventEmitter<number> = new EventEmitter();

    /**
     * Update category;
     */
    @Output() catChange: EventEmitter<number> = new EventEmitter();

    /**
     * Update name;
     */
    @Output() nameUpdate: EventEmitter<string> = new EventEmitter();

    /**
     * @ignore
     */
    strategyName = '';

    /**
     * @ignore
     */
    language = 0;

    /**
     * @ignore
     */
    category = 0;

    /**
     * Supported languages;
     */
    languages: SupportedLanguage[] = [];

    /**
     * Supported categories;
     */
    categories: Category[] = [];

    /**
     * @ignore
     */
    private _strategy: Strategy;

    constructor(
        private constant: StrategyConstantService,
        private nzModal: NzModalService,
        private strategyService: StrategyService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.categories = this.constant.STRATEGY_CATEGORIES.slice(0, -1);

        this.languages = this.constant.SUPPORTED_LANGUAGE;
    }

    /**
     * Show tip message when user selected template category;
     * @param category Current category;
     */
    showCategoryChangeTip(category: number): void {
        if (category === CategoryType.TEMPLATE_LIBRARY) {
            this.nzModal.warning({
                nzContent: SimpleNzConfirmWrapComponent,
                nzComponentParams: { content: 'CATEGORY_CHANGED_TIP' },
                nzOnOk: () => this.catChange.next(category),
                nzCancelText: null,
            });
        } else {
            this.catChange.next(category);
        }
    }

    /**
     * 监听策略编程语言的变化；
     */
    onLanguageChange(language: number): void {
        this.langChange.next(language);

        this.strategyService.updateSelectedLanguage(language);
    }
}
