import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { UploadFile } from 'ng-zorro-antd';
import * as qiniu from 'qiniu-js';
import { Observable, Subscription, zip } from 'rxjs';
import { filter, map, mapTo, switchMap, takeWhile, withLatestFrom } from 'rxjs/operators';

import { UploadService } from '../../base/upload.component';
import { keepAliveFn } from '../../interfaces/app.interface';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import { TipService } from '../../providers/tip.service';
import { ClearQiniuTokenAction } from '../../store/comment/comment.action';
import { RequestParams } from '../../store/comment/comment.reducer';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class CommentService extends UploadService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private tipService: TipService,
    ) {
        super();
    }

    //  =======================================================Server Request=======================================================

    /**
     * Get comment list
     */
    launchCommentList(source: Observable<fromReq.GetCommentListRequest>): Subscription {
        return this.process.processCommentList(source);
    }

    /**
     * Add comment
     */
    launchAddComment(source: Observable<fromReq.SubmitCommentRequest>): Subscription {
        return this.process.processAddComment(source);
    }

    /**
     * Delete comment
     */
    launchDeleteComment(source: Observable<fromReq.SubmitCommentRequest>): Subscription {
        return this.process.processDeleteComment(
            source.pipe(
                switchMap(request => this.tipService.guardRiskOperate('CONFIRM_DELETE_COMMENT').pipe(
                    mapTo(request)
                ))
            )
        );
    }

    /**
     * Update comment
     */
    launchUpdateComment(source: Observable<fromReq.SubmitCommentRequest>): Subscription {
        return this.process.processUpdateComment(source);
    }

    /**
     * Get qiniu token
     */
    launchQiniuToken(source: Observable<fromReq.GetQiniuTokenRequest>): Subscription {
        return this.process.processCommentGetQiniuToken(source);
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
     * Comment list response;
     */
    private getCommentListResponse(): Observable<fromRes.GetCommentListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectCommentListResponse)
        );
    }

    /**
     * Comment list
     */
    getCommentList(): Observable<fromRes.CommentListResponse> {
        return this.getCommentListResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * Submit comment response;
     */
    private getSubmitCommentResponse(): Observable<fromRes.SubmitCommentResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectSubmitResponse)
        );
    }

    /**
     * Submit comment
     */
    getSubmitCommentResult(): Observable<number> {
        return this.getSubmitCommentResponse().pipe(
            map(res => res.result)
        );
    }

    /**
     * Get qiniu token
     */
    getQiniuTokenResponse(): Observable<fromRes.GetQiniuTokenResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectCommentQiniuTokenResponse)
        );
    }

    /**
     * Get comment related request;
     */
    private getRequestParams(): Observable<RequestParams> {
        return this.store.pipe(
            select(fromRoot.selectCommentRequestParams)
        );
    }

    /**
     * Wether publish comment success
     */
    isPublishSuccess(): Observable<boolean> {
        return this.getSubmitCommentResult().pipe(
            withLatestFrom(
                this.getRequestParams().pipe(
                    map(state => state.addComment),
                    filter(request => !!request && request.commentId === -1)
                ),
                (result, _) => !!result
            )
        );
    }

    /**
     * @ignore
     */
    isLoading(): Observable<boolean> {
        return this.store.pipe(
            select(fromRoot.selectCommentUIState),
            map(res => res.loading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    //  =======================================================Local state change=======================================================

    /**
     * clear qiniu token
     */
    clearQiniuToken(): void {
        this.store.dispatch(new ClearQiniuTokenAction());
    }

    //  =======================================================Error Handle=======================================================

    /**
     * @ignore
     */
    handleCommentListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getCommentListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleSubmitCommentError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getSubmitCommentResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleQiniuTokenError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getQiniuTokenResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
