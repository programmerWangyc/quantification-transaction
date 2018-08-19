import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { map, startWith, takeWhile } from 'rxjs/operators';

import { Path } from '../../app.config';
import { CategoryType, GetStrategyListByNameRequest } from '../../interfaces/request.interface';
import { StrategyListByNameStrategy } from '../../interfaces/response.interface';
import { PAGE_SIZE_SELECT_VALUES } from '../../providers/constant.service';
import { UtilService } from '../../providers/util.service';
import { Category, STRATEGY_CATEGORIES } from '../../strategy/providers/strategy.constant.service';
import { StrategyRenewalComponent } from '../../strategy/strategy-renewal/strategy-renewal.component';
import { StrategyVisibilityType } from '../../strategy/strategy.config';
import { SquareService } from '../providers/square.service';

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
        private squareService: SquareService,
        private utilService: UtilService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private nzModal: NzModalService,
    ) {
    }

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
        this.squareService.launchStrategyListByName(this.getRequestParams());

        this.squareService.handleStrategyListByNameError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    initialModel() {
        this.list = this.squareService.getMarketStrategyList();

        this.total = this.squareService.getMarketStrategyTotal();

        this.categories = [{ name: 'ALL_TYPES', id: CategoryType.ALL }, ...STRATEGY_CATEGORIES.slice(0, -1)];

        this.statistics = this.utilService.getPaginationStatistics(this.total, this.pageSize);

        this.isLoading = this.squareService.isLoading();
    }

    /**
     * @ignore
     */
    navigateTo(strategy: StrategyListByNameStrategy): void {
        this.router.navigate([Path.strategy, strategy.id], { relativeTo: this.activatedRoute });
    }

    /**
     * 购买策略
     */
    buyStrategy(strategy: StrategyListByNameStrategy): void {
        const { pricing, id, username, email, name } = strategy;

        if (pricing && pricing.includes('/')) {
            this.router.navigate([Path.charge, Path.rent, id], { relativeTo: this.activatedRoute.parent });
        } else {
            this.nzModal.create({
                nzContent: StrategyRenewalComponent,
                nzComponentParams: { name, author: username, email, id },
                nzFooter: null,
            });
        }
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
            map(([offset, limit, categoryId, keyword]) => ({ offset: offset * limit, limit, categoryId, keyword, strategyType: this.strategyVisible, needArgs: this.needArgs }))
        );
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

}
