import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { filter, map, startWith, takeWhile } from 'rxjs/operators';

import { Path } from '../../app.config';
import { PublicStrategyDetail } from '../../interfaces/response.interface';
import { UtilService } from '../../providers/util.service';
import { SquareService } from '../providers/square.service';
import { StrategyRenewalComponent } from '../../tool/strategy-renewal/strategy-renewal.component';

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
     * 分享时发送给第三方的图片；
     */
    pictures: Observable<string[]>;

    constructor(
        private squareService: SquareService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private nzModal: NzModalService,
        private util: UtilService,
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
        this.detail = this.squareService.getPublicStrategyDetail();

        this.isLoading = this.squareService.isLoading();

        this.pictures = this.detail.pipe(
            map(data => data.description),
            filter(des => !!des && des.includes('image')),
            map(source => this.util.pluckPictures(source)),
            startWith([])
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.squareService.launchPublicStrategyDetail(this.activatedRoute.paramMap.pipe(
            takeWhile(() => this.isAlive),
            map(param => ({ id: +param.get('id') }))
        ));

        this.squareService.handlePublicStrategyDetailError(() => this.isAlive);
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
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
