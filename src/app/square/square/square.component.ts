import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Observable, of, Subject, merge } from 'rxjs';
import { map, mergeMap, takeWhile, filter } from 'rxjs/operators';

import { BtCommentType } from '../../app.config';
import { Breadcrumb } from '../../interfaces/app.interface';
import { SubmitCommentRequest } from '../../interfaces/request.interface';
import { CommentListResponse } from '../../interfaces/response.interface';
import { CommentService } from '../../providers/comment.service';
import { PublicService } from '../../providers/public.service';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit, OnDestroy {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_SQUARE' }];

    /**
     * comments
     */
    comment: Observable<CommentListResponse>;

    /**
     * Current user
     */
    username: Observable<string>;

    /**
     * comment total;
     */
    total: Observable<string>;

    /**
     * 评论内容
     */
    publish: Subject<string> = new Subject();

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

    /**
     * Public comment success;
     */
    isPublishSuccess: Observable<boolean>;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private publicService: PublicService,
        private commentService: CommentService,
        private translate: TranslateService,
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
        this.comment = this.commentService.getCommentList();

        this.total = this.comment.pipe(
            mergeMap(({ all }) => this.translate.get('COMMENT_COUNT', { all }))
        );

        this.username = this.publicService.getCurrentUser();

        this.isPublishSuccess = this.commentService.isPublishSuccess().pipe(
            filter(isSuccess => isSuccess)
        );
    }

    /**
     * @ignore
     */
    launch() {
        this.commentService.launchCommentList(of({ topic: BtCommentType.square, offset: -1, limit: -1 }));

        this.commentService.launchAddComment(
            merge(
                this.publish.pipe(
                    map(content => ({ topic: BtCommentType.square, content, replyId: -1, subReplyId: -1, commentId: -1 }))
                ),
                this.reply.pipe(
                    map(request => ({ ...request, topic: BtCommentType.square }))
                )
            ).pipe(
                takeWhile(() => this.isAlive)
            )
        );

        this.commentService.launchDeleteComment(
            this.delete.pipe(
                takeWhile(() => this.isAlive),
                map(request => ({ ...request, topic: BtCommentType.square }))
            )
        );

        this.commentService.launchUpdateComment(
            this.update.pipe(
                takeWhile(() => this.isAlive),
                map(request => ({ ...request, topic: BtCommentType.square }))
            )
        );
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

}
