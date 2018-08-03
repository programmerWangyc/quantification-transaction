import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

import { Observable, Subject, combineLatest, of, concat } from 'rxjs';
import { startWith, map, takeWhile, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';

import { GetStrategyListByNameRequest, CategoryType } from '../../interfaces/request.interface';
import { StrategyListByNameStrategy } from '../../interfaces/response.interface';
import { StrategyService } from '../providers/strategy.service';
import { StrategyVisibilityType } from '../strategy.config';
import { PAGE_SIZE_SELECT_VALUES } from '../../providers/constant.service';
import { Category, StrategyConstantService } from '../providers/strategy.constant.service';
import { Path } from '../../app.config';
import { UtilService } from '../../providers/util.service';
import { StrategyRenewalComponent } from '../strategy-renewal/strategy-renewal.component';

@Component({
    selector: 'app-strategy-market',
    templateUrl: './strategy-market.component.html',
    styleUrls: ['./strategy-market.component.scss'],
})
export class StrategyMarketComponent implements OnInit, OnDestroy {

    /**
     * view source data;
     */
    list: Observable<StrategyListByNameStrategy[]>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * 查询的开始位置
     */
    offset$: Subject<number> = new Subject();

    /**
     * 查询数量
     */
    limit$: Subject<number> = new Subject();

    /**
     * strategy visible type;
     */
    @Input() strategyVisible = StrategyVisibilityType.publicOrRentable;

    /**
     * category Id;
     */
    categoryId: FormControl = new FormControl(CategoryType.ALL);

    /**
     * @ignore
     */
    categories: Category[] = [];

    /**
     * 是否需要响应中返回策略的 args 字段。
     */
    @Input() needArgs = 0;

    /**
     * keyword
     * 搜索的关键字
     */
    keyword: FormControl = new FormControl();

    /**
     * 可选择的每页展示的策略数目
     */
    pageSizeSelectorValues = PAGE_SIZE_SELECT_VALUES;

    /**
     * 策略页数
     */
    pageSize = concat(of(PAGE_SIZE_SELECT_VALUES[0]), this.limit$);

    /**
     * 策略总数
     */
    total: Observable<number>;

    /**
     * 当前页码
     */
    currentPage = 1;

    /**
     * 统计数据
     */
    statistics: Observable<string>;

    /**
     * @ignore
     */
    tableHead: string[] = ['NAME', 'AUTHOR', 'LANGUAGE', 'STRATEGY_TYPE', 'COPY_COUNT', 'LATEST_MODIFY', 'OPERATE'];

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    constructor(
        private strategyService: StrategyService,
        private constant: StrategyConstantService,
        private router: Router,
        private utilService: UtilService,
        private activatedRoute: ActivatedRoute,
        private nzModal: NzModalService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();
    }

    /**
     * @ignore
     */
    launch() {
        this.strategyService.launchStrategyListByName(this.getRequestParams());

        this.strategyService.handleStrategyListByNameError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    initialModel() {
        this.list = this.strategyService.getMarketStrategyList();

        this.total = this.strategyService.getMarketStrategyTotal();

        this.categories = [{ name: 'ALL_TYPES', id: CategoryType.ALL }, ...this.constant.STRATEGY_CATEGORIES.slice(0, -1)];

        this.statistics = this.utilService.getPaginationStatistics(this.total, this.pageSize);

        this.isLoading = this.strategyService.isLoading();
    }

    /**
     * 接口发送的参数流
     */
    private getRequestParams(): Observable<GetStrategyListByNameRequest> {
        return combineLatest(
            this.offset$.pipe(
                startWith(this.currentPage),
                map(page => page - 1)
            ),
            this.pageSize,
            this.categoryId.valueChanges.pipe(
                startWith(this.categoryId.value)
            ),
            this.keyword.valueChanges.pipe(
                startWith('')
            )
        ).pipe(
            takeWhile(() => this.isAlive),
            tap(v => console.log(v)),
            map(([offset, limit, categoryId, keyword]) => ({ offset: offset * limit, limit, categoryId, keyword, strategyType: this.strategyVisible, needArgs: this.needArgs }))
        );
    }

    /**
     * @ignore
     */
    navigateTo(strategy: StrategyListByNameStrategy): void {
        console.log(strategy);
        this.router.navigate([Path.strategy, strategy.id]);
    }

    /**
     * 购买策略
     */
    buyStrategy(strategy: StrategyListByNameStrategy): void {
        const { pricing, id, username, email, name } = strategy;

        if (pricing && pricing.includes('/')) {
            this.router.navigate([Path.strategy, Path.rent, id], { relativeTo: this.activatedRoute.parent });
        } else {
            this.nzModal.create({
                nzContent: StrategyRenewalComponent,
                nzComponentParams: { name, author: username, email, id },
                nzFooter: null,
            });
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

}
