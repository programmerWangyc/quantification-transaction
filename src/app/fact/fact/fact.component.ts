import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { isEmpty } from 'lodash';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

import { BtCommentType } from '../../app.config';
import { CommentService } from '../../comment/providers/comment.service';
import { Breadcrumb } from '../../interfaces/app.interface';
import { PublicRobot, RobotStatus } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { RobotService } from '../../robot/providers/robot.service';
import { CommentBaseComponent } from '../../square/square/square.component';

@Component({
    selector: 'app-fact',
    templateUrl: './fact.component.html',
    styleUrls: ['./fact.component.scss'],
})
export class FactComponent extends CommentBaseComponent implements OnInit, OnDestroy {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'FACT_FINDER' }];

    /**
     * @ignore
     */
    isLoading: Observable<boolean>;

    /**
     * @ignore
     */
    robots: Observable<PublicRobot[]>;

    /**
     * @ignore
     */
    search: FormControl = new FormControl('');

    /**
     * @ignore
     */
    isAlive = true;

    constructor(
        public publicService: PublicService,
        public commentService: CommentService,
        public translate: TranslateService,
        private robotService: RobotService,
    ) {
        super(publicService, commentService, translate);
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch(BtCommentType.live, () => this.isAlive);

        this.privateInitialModel();

        this.privateLaunch();
    }

    /**
     * @ignore
     */
    private privateInitialModel() {
        this.isLoading = this.robotService.isLoading();

        this.robots = combineLatest(
            this.robotService.getPublicRobotList().pipe(
                map(robots => robots.filter(item => item.status === RobotStatus.RUNNING))
            ),
            this.search.valueChanges.pipe(
                startWith(''),
                debounceTime(300),
                distinctUntilChanged()
            )
        ).pipe(
            map(([robots, keyword]) => isEmpty(keyword) ? robots : robots.filter(robot => robot.strategy_name.includes(keyword) || robot.name.includes(keyword)))
        );
    }

    /**
     * @ignore
     */
    private privateLaunch() {
        this.robotService.launchPublicRobotList(of({ offset: -1, limit: -1, status: -1 }));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
