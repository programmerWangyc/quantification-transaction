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
    styleUrls: ['./strategy-des.component.scss'],
})
export class StrategyDesComponent implements OnInit {




    @Input() set strategy(value: Strategy) {
        if (!value) return;

        this.strategyName = value.name;

        this.language = value.language;

        this.category = value.category;

        this.strategyService.updateSelectedLanguage(this.language);
    }

    @Input() set isCopy(input: boolean) {
        this.strategyName = input ? this.strategyName + '(copy)' : this.strategyName;
    }




    @Output() langChange: EventEmitter<number> = new EventEmitter();




    @Output() catChange: EventEmitter<number> = new EventEmitter();




    @Output() nameUpdate: EventEmitter<string> = new EventEmitter();




    strategyName = '';




    language = 0;




    category = 0;




    languages: SupportedLanguage[] = [];




    categories: Category[] = [];

    constructor(
        private constant: StrategyConstantService,
        private nzModal: NzModalService,
        private strategyService: StrategyService,
    ) { }




    ngOnInit() {
        this.categories = this.constant.STRATEGY_CATEGORIES.slice(0, -1);

        this.languages = this.constant.SUPPORTED_LANGUAGE;

        this.strategyService.updateSelectedLanguage(this.language);

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




    onLanguageChange(language: number): void {
        this.langChange.next(language);

        this.strategyService.updateSelectedLanguage(language);
    }
}
