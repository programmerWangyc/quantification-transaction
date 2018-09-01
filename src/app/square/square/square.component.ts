import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { merge, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, takeWhile } from 'rxjs/operators';

import { BtCommentType } from '../../app.config';
import { CommentService } from '../../comment/providers/comment.service';
import { Breadcrumb } from '../../interfaces/app.interface';
import { SubmitCommentRequest } from '../../interfaces/request.interface';
import { CommentListResponse } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';

export class CommentBaseComponent {

    /**
     * comment total;
     */
    total: Observable<string>;

    /**
     * 评论内容
     */
    publish: Subject<string> = new Subject();

    /**
     * Current user
     */
    username: Observable<string>;

    /**
     * Public comment success;
     */
    isPublishSuccess: Observable<boolean>;

    /**
     * comments
     */
    comment: Observable<CommentListResponse>;

    /**
     * delete comment
     */
    delete: Subject<SubmitCommentRequest> = new Subject();

    /**
     * update comment;
     */
    update: Subject<SubmitCommentRequest> = new Subject();

    /**
     * reply comment;
     */
    reply: Subject<SubmitCommentRequest> = new Subject();

    constructor(
        public publicService: PublicService,
        public commentService: CommentService,
        public translate: TranslateService,
    ) { }

    /**
     * @ignore
     */
    protected launch(topic: string, keepAlive: () => boolean): void {
        this.commentService.launchCommentList(of({ topic, offset: -1, limit: -1 }));

        this.commentService.launchAddComment(
            merge(
                this.publish.pipe(
                    map(content => ({ topic, content, replyId: -1, subReplyId: -1, commentId: -1 }))
                ),
                this.reply.pipe(
                    map(request => ({ ...request, topic: BtCommentType.square }))
                )
            ).pipe(
                takeWhile(keepAlive)
            )
        );

        this.commentService.launchDeleteComment(
            this.delete.pipe(
                takeWhile(keepAlive),
                map(request => ({ ...request, topic: BtCommentType.square }))
            )
        );

        this.commentService.launchUpdateComment(
            this.update.pipe(
                takeWhile(keepAlive),
                map(request => ({ ...request, topic: BtCommentType.square }))
            )
        );

        this.commentService.handleCommentListError(keepAlive);

        this.commentService.handleSubmitCommentError(keepAlive);

        this.commentService.handleQiniuTokenError(keepAlive);
    }

    /**
     * @ignore
     */
    protected initialModel(): void {
        this.comment = this.commentService.getCommentList();

        this.total = this.comment.pipe(
            mergeMap(({ all }) => this.translate.get('COMMENT_COUNT', { all }))
        );

        this.username = this.publicService.getCurrentUser();

        this.isPublishSuccess = this.commentService.isPublishSuccess().pipe(
            filter(isSuccess => isSuccess)
        );
    }
}

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent extends CommentBaseComponent implements OnInit, OnDestroy {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_SQUARE' }];

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        public publicService: PublicService,
        public commentService: CommentService,
        public translate: TranslateService,
    ) {
        super(publicService, commentService, translate);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch(BtCommentType.square, () => this.isAlive);
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

}
