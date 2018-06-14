import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';

import { CategoryType } from '../../interfaces/request.interface';
import { Strategy } from '../../interfaces/response.interface';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { Category, StrategyConstantService, SupportedLanguage } from '../providers/strategy.constant.service';

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

        this.language = value.language;

        this.category = value.category;
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
        private nzModal: NzModalService,
    ) { }

    ngOnInit() {
        this.categories = this.constant.STRATEGY_CATEGORIES.slice(0, -1);

        this.languages = this.constant.SUPPORTED_LANGUAGE;
    }

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
}
