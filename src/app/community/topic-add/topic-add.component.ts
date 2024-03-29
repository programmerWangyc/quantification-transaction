import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { of } from 'rxjs';
import { map, filter, takeWhile } from 'rxjs/operators';

import { Breadcrumb, DeactivateGuard } from '../../interfaces/app.interface';
import { CommunityService } from '../providers/community.service';
import { BBSTopicForm, TopicFormComponent } from '../topic-form/topic-form.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CanDeactivateComponent } from '../../base/guard.service';

@Component({
    selector: 'app-topic-add',
    templateUrl: './topic-add.component.html',
    styleUrls: ['./topic-add.component.scss'],
})
export class TopicAddComponent implements OnInit, OnDestroy, CanDeactivateComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'COMMUNITY', path: '../' }, { name: 'POSTING' }];

    /**
     * @ignore
     */
    @ViewChild(TopicFormComponent) formComponent: TopicFormComponent;

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        private communityService: CommunityService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.communityService.isAddTopicSuccess().pipe(
            filter(isSuccess => isSuccess),
            takeWhile(() => this.isAlive)
        ).subscribe(_ => this.router.navigate(['../'], { relativeTo: this.route }));
    }

    /**
     * 提交表单
     */
    addTopic(value: BBSTopicForm): void {
        this.communityService.launchAddBBSTopic(
            of(value).pipe(
                map(({ title, topic, content }) => ({ id: -1, nodeId: topic, content, title })),
            )
        );
    }

    /**
     * @ignore
     */
    canDeactivate(): DeactivateGuard[] {
        return this.formComponent.canDeactivate();
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.communityService.clearBBSOperateState();

        this.isAlive = false;
    }
}
