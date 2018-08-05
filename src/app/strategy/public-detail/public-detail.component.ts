import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { filter, map, startWith, takeWhile } from 'rxjs/operators';

import { PublicStrategyDetail } from '../../interfaces/response.interface';
import { StrategyService } from '../providers/strategy.service';
import { StrategyRenewalComponent } from '../strategy-renewal/strategy-renewal.component';
import { Path } from '../../app.config';

@Component({
    selector: 'app-public-detail',
    templateUrl: './public-detail.component.html',
    styleUrls: ['./public-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PublicDetailComponent implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * strategy detail
     */
    detail: Observable<PublicStrategyDetail>;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * 分享时的图片；
     */
    pictures: Observable<string[]>;

    constructor(
        private strategyService: StrategyService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
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
    initialModel() {
        this.detail = this.strategyService.getPublicStrategyDetail();

        this.isLoading = this.strategyService.isLoading();

        this.pictures = this.detail.pipe(
            map(data => data.description),
            filter(des => !!des && des.includes('image')),
            map(source => this.getAllPictures(source)),
            startWith([])
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.strategyService.launchPublicStrategyDetail(this.activatedRoute.paramMap.pipe(
            takeWhile(() => this.isAlive),
            map(param => ({ id: +param.get('id') }))
        ));
    }

    /**
     * @ignore
     */
    navigateTo(strategy: PublicStrategyDetail): void {
        this.router.navigate([Path.strategy, Path.copy, strategy.id], { relativeTo: this.activatedRoute.parent });
    }

    /**
     * 购买策略
     */
    buyStrategy(strategy: PublicStrategyDetail): void {
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
     * get all pictures;
     */
    private getAllPictures(source: string): string[] {
        const reg = /http[s]?:\/{2}.*\.(jpg|png)/g;

        let result = [];

        const urls = [];

        while (true) {
            result = reg.exec(source);

            if (!!result) {
                urls.push(result[0]);
            } else {
                break;
            }
        }

        return urls;
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
