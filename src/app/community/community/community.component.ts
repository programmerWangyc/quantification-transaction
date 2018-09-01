import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { combineLatest, Observable, of, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeWhile } from 'rxjs/operators';

import { Breadcrumb, TableStatistics } from '../../interfaces/app.interface';
import { GetBBSTopicListBySlugRequest } from '../../interfaces/request.interface';
import { BBSNode, BBSPlane, BBSTopic } from '../../interfaces/response.interface';
import { ConstantService } from '../../providers/constant.service';
import { CommunityService } from '../providers/community.service';

@Component({
    selector: 'app-community',
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.scss'],
})
export class CommunityComponent implements OnInit {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'COMMUNITY' }];

    /**
     * @ignore
     */
    planes: Observable<BBSPlane[]>;

    /**
     * @ignore
     */
    nodes: Observable<BBSNode[]>;

    /**
     * topics
     */
    topics: Observable<BBSTopic[]>;

    /**
     * topics total
     */
    total: Observable<number>;

    /**
     * Slugs
     */
    slugs$: Subject<string> = new Subject();

    /**
     * page
     */
    page$: Subject<number> = new Subject();

    /**
     * limit
     */
    limit$: Subject<number> = new Subject();

    /**
     * Search by key word
     */
    search: FormControl = new FormControl('');

    /**
     * page sizes
     */
    pageSizes: number[];

    /**
     * page size
     */
    limit: number;

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    statisticsParams: Observable<TableStatistics>;

    constructor(
        private bbs: CommunityService,
        private constant: ConstantService,
        private router: Router,
        private route: ActivatedRoute,
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
    initialModel() {
        this.planes = this.bbs.getBBSPlanes();

        this.nodes = this.bbs.getBBSNodes();

        this.topics = this.bbs.getBBSTopics();

        this.total = this.bbs.getBBSTopicsTotal();

        this.pageSizes = this.constant.PAGE_SIZE_SELECT_VALUES;

        this.limit = this.pageSizes[0];

        this.isLoading = this.bbs.isLoading();

        this.statisticsParams = combineLatest(
            this.total,
            this.limit$.asObservable().pipe(
                startWith(this.pageSizes[0])
            )
        ).pipe(
            map(( [total, pageSize] ) => this.bbs.getTableStatistics(total, pageSize))
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.bbs.launchBBSPlaneList(of(null));

        this.bbs.launchBBSNodeList(of(null));

        this.bbs.launchBBSTopicListBySlug(this.createTopicQueryParams());

        this.bbs.handleBBSPlaneListError(() => this.isAlive);

        this.bbs.handleBBSNodeListError(() => this.isAlive);

        this.bbs.handleBBSTopicListBySlugError(() => this.isAlive);
    }

    /**
     * @ignore
     */
    private createTopicQueryParams(): Observable<GetBBSTopicListBySlugRequest> {
        return combineLatest(
            this.slugs$.pipe(
                startWith('')
            ),
            this.page$.pipe(
                startWith(1),
            ),
            this.limit$.pipe(
                startWith(this.limit),
            ),
            this.search.valueChanges.pipe(
                debounceTime(500),
                startWith('')
            )
        ).pipe(
            map(([slug, page, limit, keyword]) => ({ slug, offset: (page - 1) * limit, limit, keyword })),
            takeWhile(() => this.isAlive)
        );
    }

    /**
     * @ignore
     */
    navigateTo() {
        this.router.navigate(['add'], { relativeTo: this.route });
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
