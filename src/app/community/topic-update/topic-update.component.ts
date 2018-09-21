import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Breadcrumb, DeactivateGuard } from '../../interfaces/app.interface';
import { BBSTopicById } from '../../interfaces/response.interface';
import { TopicFormComponent } from '../topic-form/topic-form.component';
import { CanDeactivateComponent } from '../../base/guard.service';

@Component({
    selector: 'app-topic-update',
    templateUrl: './topic-update.component.html',
    styleUrls: ['./topic-update.component.scss'],
})
export class TopicUpdateComponent implements OnInit, CanDeactivateComponent {

    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'COMMUNITY', path: '../../' }, { name: 'UPDATE' }];

    /**
     * @ignore
     */
    @ViewChild(TopicFormComponent) formComponent: TopicFormComponent;

    /**
     * @ignore
     */
    topic: Observable<BBSTopicById>;

    constructor(
        private route: ActivatedRoute,
    ) { }

    canDeactivate(): DeactivateGuard[] {
        return this.formComponent.canDeactivate();
    }

    ngOnInit() {
        this.topic = this.route.data.pipe(
            map((data: { topic: BBSTopicById }) => data.topic)
        );
    }

}
