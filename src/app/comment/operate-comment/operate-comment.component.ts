import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { takeWhile } from 'rxjs/operators';

import { PublicService } from '../../providers/public.service';
import { CommentContent } from '../comment/comment.component';

@Component({
    selector: 'app-operate-comment',
    templateUrl: './operate-comment.component.html',
    styleUrls: ['./operate-comment.component.scss'],
})
export class OperateCommentComponent implements OnInit {

    /**
     * target
     */
    @Input() comment: CommentContent;

    /**
     * delete
     */
    @Output() delete: EventEmitter<any> = new EventEmitter();

    /**
     * edit
     */
    @Output() edit: EventEmitter<any> = new EventEmitter();

    /**
     * 当前用户
     */
    username: string;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * 是否显示控制按钮
     */
    showBtn = false;

    constructor(
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.publicService.getCurrentUser().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(username => this.username = username);
    }

    /**
     * 显示操作按钮
     */
    showOperateBtn(): void {
        if (this.comment.username === this.username) {
            this.showBtn = true;
        }
    }

    /**
     * 隐藏操作按钮
     */
    hideOperateBtn(): void {
        this.showBtn = false;
    }
}
