import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, of, Subject, combineLatest } from 'rxjs';
import { map, startWith, takeWhile, debounceTime } from 'rxjs/operators';

import { Breadcrumb } from '../../interfaces/app.interface';
import { BBSNode, BBSPlane, BBSTopic } from '../../interfaces/response.interface';
import { GetBBSTopicListBySlugRequest } from '../../interfaces/request.interface';
import { CommunityService } from '../providers/community.service';
import { ConstantService } from '../../providers/constant.service';

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
    isAlive = true;

    constructor(
        private bbs: CommunityService,
        private constant: ConstantService,
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
    ngOnDestroy() {
        this.isAlive = false;
    }

}
