import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';

import { from, Subject, zip } from 'rxjs';
import { groupBy, mergeMap, partition, reduce, takeWhile } from 'rxjs/operators';

import { SubmitCommentRequest } from '../../interfaces/request.interface';
import { BtComment, CommentListResponse, Reply } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';

interface DetailedReply extends Reply {
    replyUsername: string;
}

/**
 * replyGroup: 回复评论的内容
 * discussGroup: 此评论下回复其它用户的内容
 */
interface DetailedComment extends BtComment {
    openReply: boolean;
    replyGroup: DetailedReply[];
    discussGroup: DetailedReply[];
    showDiscuss?: boolean;
}

export type CommentContent = DetailedComment | DetailedReply;

export enum replyType {
    replyMain,
    replayDiscuss,
}

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit, OnDestroy {

    /**
     * comment response
     */
    @Input() set comment(input: CommentListResponse) {
        input && this.createCommentList(input);
    }

    /**
     * 回复
     */
    @Output() reply: EventEmitter<SubmitCommentRequest> = new EventEmitter();

    /**
     * 删除回
     */
    @Output() delete: EventEmitter<SubmitCommentRequest> = new EventEmitter();

    /**
     * 更新回复
     */
    @Output() update: EventEmitter<SubmitCommentRequest> = new EventEmitter();

    /**
     * 加工后的评论数据，每条评论下都带有回复内容和其它讨论的内容；
     */
    commentList: DetailedComment[] = [];

    /**
     * content need to edit;
     */
    editContent: Subject<string> = new Subject();

    /**
     * current user
     */
    username: string;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private publicService: PublicService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.publicService.getCurrentUser().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(username => this.username = username);
    }

    /**
     * 合并comment list 和 reply list 的数据，生成完成的 comment list 列表；
     * @param data comment list response
     */
    private createCommentList(data: CommentListResponse): void {
        const { comments, reply } = data;

        from(reply).pipe(
            groupBy(item => item.reply_id),
            mergeMap(obs => {
                const [mainReplies, discuss] = partition((item: Reply) => !item.sub_reply_id)(obs);

                return zip(
                    mainReplies.pipe(
                        reduce(this.accumulate, [])
                    ),
                    discuss.pipe(
                        reduce(this.accumulate, [])
                    ),
                    (replyGroup, discussGroup) => ({ replyGroup, discussGroup, id: obs.key })
                );
            }),
            reduce(this.accumulate, [])
        ).subscribe(replies => {
            this.commentList = comments.map(comment => {
                const target = replies.find(item => item.id === comment.id);

                if (target) {
                    const { replyGroup, discussGroup } = target;

                    return {
                        ...comment,
                        replyGroup: replyGroup.map(item => {
                            const com = comments.find(ele => ele.id === item.reply_id);

                            return { ...item, replyUsername: com.username };
                        }),
                        discussGroup: discussGroup.map(item => {
                            const dis = reply.find(ele => ele.id === item.sub_reply_id);

                            return { ...item, replyUsername: dis.username };
                        }),
                        openReply: false,
                        showDiscuss: false,
                    };
                } else {
                    return { ...comment, replyGroup: [], discussGroup: [], openReply: false, showDiscuss: false };
                }
            });
        });
    }

    /**
     * @ignore
     */
    onReply(content: string, comment: CommentContent, type: number): void {
        if (type === replyType.replyMain) {
            this.reply.next({ topic: '', content, commentId: -1, replyId: comment.id, subReplyId: -1 });
        } else {
            const { reply_id, id } = <DetailedReply>comment;

            this.reply.next({ topic: '', content, commentId: -1, replyId: reply_id, subReplyId: id });
        }
    }

    /**
     * delete comment
     */
    onDelete(comment: CommentContent): void {
        this.delete.next({ topic: '', content: '', commentId: comment.id, replyId: -1, subReplyId: -1 });
    }

    /**
     * @ignore
     */
    onUpdate(content: string, comment: CommentContent): void {
        this.update.next({ topic: '', content: content, commentId: comment.id, replyId: comment.id, subReplyId: -1 });
    }

    /**
     * 是否可以回复此评论，目前只有当不是本人的评论内容时才可回复
     */
    canReply(comment: CommentContent): boolean {
        return comment.username !== this.username;
    }

    /**
     * @ignore
     */
    private accumulate<T>(acc: T[], cur: T): T[] {
        return [...acc, cur];
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
