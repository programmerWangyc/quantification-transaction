import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { UploadFile } from 'ng-zorro-antd';
import * as qiniu from 'qiniu-js';
import { Observable, Subscription, zip } from 'rxjs';
import { filter, map, mapTo, switchMap, withLatestFrom } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import * as fromReq from '../interfaces/request.interface';
import * as fromRes from '../interfaces/response.interface';
import { ClearQiniuTokenAction } from '../store/comment/comment.action';
import { RequestParams } from '../store/comment/comment.reducer';
import * as fromRoot from '../store/index.reducer';
import { ConfirmComponent } from '../tool/confirm/confirm.component';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { TipService } from './tip.service';

@Injectable()
export class CommentService extends BaseService {

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
                switchMap(request => this.tipService.confirmOperateTip(ConfirmComponent, { message: 'CONFIRM_DELETE_COMMENT', needTranslate: true }).pipe(
                    this.filterTruth(),
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
        return this.process.processGetQiniuToken(source);
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
            select(fromRoot.selectCommentListResponse),
            this.filterTruth()
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
            select(fromRoot.selectSubmitResponse),
            this.filterTruth()
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
    private getQiniuTokenResponse(): Observable<fromRes.GetQiniuTokenResponse> {
        return this.store.pipe(
            select(fromRoot.selectQiniuTokenResponse),
            this.filterTruth()
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
            map(res => res.loading)
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
    handleCommentListError(): Subscription {
        return this.error.handleResponseError(this.getCommentListResponse());
    }

    /**
     * @ignore
     */
    handleSubmitCommentError(): Subscription {
        return this.error.handleResponseError(this.getSubmitCommentResponse());
    }

    /**
     * @ignore
     */
    handleQiniuTokenError(): Subscription {
        return this.error.handleResponseError(this.getQiniuTokenResponse());
    }
}
