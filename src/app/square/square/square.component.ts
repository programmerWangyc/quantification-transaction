import { Component, OnInit } from '@angular/core';

import { Observable, of } from 'rxjs';

import { BtCommentType } from '../../app.config';
import { Breadcrumb } from '../../interfaces/app.interface';
import { CommentListResponse } from '../../interfaces/response.interface';
import { CommentService } from '../../providers/comment.service';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_SQUARE' }];

    /**
     * comments
     */
    comment: Observable<CommentListResponse>;

    constructor(
        private commentService: CommentService,
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
    }

    /**
     * @ignore
     */
    launch() {
        this.commentService.launchCommentList(of({ topic: BtCommentType.square, offset: -1, limit: -1 }));
    }

}
