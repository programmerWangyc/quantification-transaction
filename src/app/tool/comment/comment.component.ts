import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { from, zip } from 'rxjs';
import { groupBy, mergeMap, partition, reduce } from 'rxjs/operators';

import { BtComment, CommentListResponse, Reply } from '../../interfaces/response.interface';

interface DetailedReply extends Reply {
    replyUsername: string;
}

interface DetailedComment extends BtComment {
    openReply: boolean;
    replyGroup: DetailedReply[];
    discussGroup: DetailedReply[];
    showDiscuss?: boolean;
}

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
    @Input() set comment(input: CommentListResponse) {
        if (input) {
            const { all } = input;

            this.commentList = this.createCommentList(input);

            // this.replyList = reply;

            this.total = all;
        }
    }

    @Output() publish: EventEmitter<string> = new EventEmitter();

    @Output() reply: EventEmitter<string> = new EventEmitter();

    commentList: DetailedComment[] = [];

    replyList: Reply[] = [];

    total = 0;

    constructor() { }

    ngOnInit() {
    }

    onReply(content: string, comment: DetailedComment): void {
        console.log(content, comment);
    }

    /**
     * 合并comment list 和 reply list 的数据，生成完成的 comment list 列表；
     * @param data comment list response
     */
    private createCommentList(data: CommentListResponse): DetailedComment[] {
        const { comments, reply } = data;

        let result: DetailedComment[] = [];

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
            result = comments.map(comment => {
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

        return result;
    }

    private accumulate<T>(acc: T[], cur: T): T[] {
        return [...acc, cur];
    }
}
