import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';
import { ActivatedRoute } from '@angular/router';
import { CommentService } from '../../providers/comment.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommentListResponse } from '../../interfaces/response.interface';
import { BtCommentType } from '../../app.config';

@Component({
    selector: 'app-strategy-detail',
    templateUrl: './strategy-detail.component.html',
    styleUrls: ['./strategy-detail.component.scss'],
})
export class StrategyDetailComponent implements OnInit {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_SQUARE', path: '../../' }, { name: 'STRATEGY_DETAIL' }];

    /**
     * comments
     */
    comment: Observable<CommentListResponse>;

    constructor(
        private activatedRoute: ActivatedRoute,
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
        this.commentService.launchCommentList(this.activatedRoute.paramMap.pipe(
            map(param => ({ topic: BtCommentType.strategy + param.get('id'), offset: -1, limit: -1 }))
        ));
    }
}
