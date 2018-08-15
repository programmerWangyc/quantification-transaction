import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as fromRoot from '../../store/index.reducer';
import { ResetBBSTopicAction } from '../../store/bbs/bbs.action';

@Injectable()
export class CommunityService extends BaseService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchBBSPlaneList(obs: Observable<any>): Subscription {
        return this.process.processBBSPlaneList(obs);
    }

    /**
     * @ignore
     */
    launchBBSNodeList(obs: Observable<any>): Subscription {
        return this.process.processBBSNodeList(obs);
    }

    /**
     * @ignore
     */
    launchBBSTopicListBySlug(obs: Observable<fromReq.GetBBSTopicListBySlugRequest>): Subscription {
        return this.process.processBBSTopicListBySlug(obs);
    }

    /**
     * @ignore
     */
    launchBBSTopicById(obs: Observable<fromReq.GetBBSTopicRequest>): Subscription {
        return this.process.processBBSTopicById(obs);
    }

    //  =======================================================Date acquisition=======================================================

    /**
     * @ignore
     */
    private getBBSPlaneListResponse(): Observable<fromRes.GetBBSPlaneListResponse> {
        return this.store.pipe(
            select(fromRoot.selectBBSPlaneListResponse),
            this.filterTruth()
        );
    }

    /**
     * bbs planes
     */
    getBBSPlanes(): Observable<fromRes.BBSPlane[]> {
        return this.getBBSPlaneListResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * @ignore
     */
    private getBBSNodeListResponse(): Observable<fromRes.GetBBSNodeListResponse> {
        return this.store.pipe(
            select(fromRoot.selectBBSNodeListResponse),
            this.filterTruth()
        );
    }

    /**
     * bbs nodes
     */
    getBBSNodes(): Observable<fromRes.BBSNode[]> {
        return this.getBBSNodeListResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * @ignore
     */
    private getBBSTopicListBySlugResponse(): Observable<fromRes.GetBBSTopicListBySlugResponse> {
        return this.store.pipe(
            select(fromRoot.selectBBSTopicListBySlugResponse),
            this.filterTruth()
        );
    }

    /**
     * bbs topics
     */
    getBBSTopics(): Observable<fromRes.BBSTopic[]> {
        return this.getBBSTopicListBySlugResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * Total amount of topics;
     */
    getBBSTopicsTotal(): Observable<number> {
        return this.getBBSTopicListBySlugResponse().pipe(
            map(res => res.result.all_items)
        );
    }

    /**
     * @ignore
     */
    private getBBSTopicByIdResponse(): Observable<fromRes.GetBBSTopicResponse> {
        return this.store.pipe(
            select(fromRoot.selectBBSTopicByIdResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getBBSTopic(): Observable<fromRes.BBSTopicById> {
        return this.getBBSTopicByIdResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * @ignore
     */
    isLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectBBSUiState),
            map(state => state.loading)
        );
    }

    //  =======================================================Shortcut methods=======================================================

    //  =======================================================Local state change=======================================================

    /**
     * @ignore
     */
    resetTopicState(): void {
        this.store.dispatch(new ResetBBSTopicAction());
    }

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleBBSPlaneListError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getBBSPlaneListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleBBSNodeListError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getBBSNodeListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleBBSTopicListBySlugError(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getBBSTopicListBySlugResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleBBSTopicByIdResponse(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getBBSTopicByIdResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
