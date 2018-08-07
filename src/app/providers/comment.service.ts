import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { map, switchMap, mapTo } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import * as fromReq from '../interfaces/request.interface';
import * as fromRes from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { TipService } from './tip.service';
import { ConfirmComponent } from '../tool/confirm/confirm.component';

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

    //  =======================================================Local state change=======================================================

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
