import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommentService } from '../../comment/providers/comment.service';
import { Breadcrumb } from '../../interfaces/app.interface';
import { BBSTopicById } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { UtilService } from '../../providers/util.service';
import { CommentBaseComponent } from '../../square/square/square.component';
import { CommunityService } from '../providers/community.service';

@Component({
    selector: 'app-topic',
    templateUrl: './topic.component.html',
    styleUrls: ['./topic.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TopicComponent extends CommentBaseComponent implements OnInit, OnDestroy {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'COMMUNITY', path: '../../' }];

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    topic: BBSTopicById;

    /**
     * Use when share bbs;
     */
    pictures: string[] = [];

    /**
     * 发贴人是本人时显示编辑
     */
    isTopicOwner: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private bbs: CommunityService,
        private util: UtilService,
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

        this.route.data.subscribe((data: { topic: BBSTopicById }) => {
            const { topic } = data;

            this.topic = topic;

            this.launch(topic.md5, () => this.isAlive);

            this.pictures = this.util.pluckPictures(topic.content);
        });

        this.privateInitialModel();
    }

    /**
     * @ignore
     */
    private privateInitialModel() {
        this.paths = [...this.paths, { name: this.route.snapshot.paramMap.get('title') }];

        this.isTopicOwner = this.publicService.getCurrentUser().pipe(
            map(username => username === this.topic.author)
        );
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;

        this.bbs.resetTopicState();
    }
}
