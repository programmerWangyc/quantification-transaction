import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, map, startWith, takeWhile } from 'rxjs/operators';

import { Path } from '../../app.config';
import { PublicStrategyDetail } from '../../interfaces/response.interface';
import { UtilService } from '../../providers/util.service';
import { SquareService } from '../providers/square.service';
import { SquareStrategyBase } from '../strategy-market/strategy-market.component';
import { NzModalService } from 'ng-zorro-antd';
import { PublicService } from '../../providers/public.service';

@Component({
    selector: 'app-public-detail',
    templateUrl: './public-detail.component.html',
    styleUrls: ['./public-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class PublicDetailComponent extends SquareStrategyBase implements OnInit, OnDestroy {

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
        private util: UtilService,
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public nzModal: NzModalService,
        public publicService: PublicService,
    ) {
        super(router, activatedRoute, nzModal, publicService);
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
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
