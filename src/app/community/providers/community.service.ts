import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { UploadFile } from 'ng-zorro-antd';
import * as qiniu from 'qiniu-js';
import { Observable, Subscription, zip } from 'rxjs';
import { map, take, takeWhile } from 'rxjs/operators';

import { UploadService } from '../../base/upload.component';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { GroupedList, UtilService } from '../../providers/util.service';
import { ResetBBSTopicAction, ClearQiniuTokenAction } from '../../store/bbs/bbs.action';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class CommunityService extends UploadService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private error: ErrorService,
        private utilService: UtilService,
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

    /**
     * @ignore
     */
    launchAddBBSTopic(obs: Observable<fromReq.AddBBSTopicRequest>): Subscription {
        return this.process.processAddBBSTopic(obs);
    }

    /**
     * Get qiniu token
     */
    launchQiniuToken(source: Observable<fromReq.GetQiniuTokenRequest>): Subscription {
        return this.process.processBBSGetQiniuToken(source);
    }

    /**
     * Upload file to qiniu server;
     * @param fileObs File flow to be uploaded;
     * @returns index文件上传时的索引，方便映射到上传文上；
     */
    uploadImage(fileObs: Observable<UploadFile>): Observable<{ index: number; obs: Qiniu.Observable }> {
        return zip(
            fileObs,
            this.getQiniuTokenResponse().pipe(
                this.filterTruth(),
                map(res => res.result)
            )
        ).pipe(
            map(([file, token], index) => ({ index, obs: qiniu.upload(file, file.name, token, {}, {}) }))
        );
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
     * 分组的的bbs node；
     */
    getGroupedBBSNodes(): Observable<GroupedList<fromRes.BBSNode>[]> {
        return this.utilService.getGroupedList(this.getBBSNodes(), 'plane_id', this.getPlaneName());
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

    /**
     * @ignore
     */
    private getAddBBSTopicResponse(): Observable<fromRes.AddBBSTopicResponse> {
        return this.store.pipe(
            select(fromRoot.selectAddBBSTopicResponse),
            this.filterTruth()
        );
    }

    /**
     * 是否发贴成功
     */
    isAddTopicSuccess(): Observable<boolean> {
        return this.getAddBBSTopicResponse().pipe(
            map(res => !!res.result)
        );
    }

    /**
     * Get qiniu token
     */
    getQiniuTokenResponse(): Observable<fromRes.GetQiniuTokenResponse> {
        return this.store.pipe(
            select(fromRoot.selectBBSQiniuTokenResponse),
            this.filterTruth()
        );
    }

    //  =======================================================Shortcut methods=======================================================

    /**
     * @ignore
     */
    private getPlaneName(): (id: number) => string {
        let planes: fromRes.BBSPlane[] = null;

        this.getBBSPlanes().pipe(
            take(1)
        ).subscribe(ary => planes = ary);

        return (id: number) => planes.find(item => item.id === id).name;
    }

    //  =======================================================Local state change=======================================================

    /**
     * @ignore
     */
    resetTopicState(): void {
        this.store.dispatch(new ResetBBSTopicAction());
    }

    /**
     * clear qiniu token
     */
    clearQiniuToken(): void {
        this.store.dispatch(new ClearQiniuTokenAction());
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

    /**
     * @ignore
     */
    handleAddBBSTopicResponse(keepAlive: () => boolean): Subscription {
        return this.error.handleResponseError(this.getAddBBSTopicResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
