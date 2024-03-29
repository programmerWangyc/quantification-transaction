import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UploadFile } from 'ng-zorro-antd';
import { Observable, of, Subject } from 'rxjs';
import { auditTime, takeWhile } from 'rxjs/operators';

import { UploadBaseComponent } from '../../base/upload.component';
import { BBSNode, BBSTopicById } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { GroupedList } from '../../providers/util.service';
import { CommunityService } from '../providers/community.service';
import { TopicContentEditComponent } from '../topic-content-edit/topic-content-edit.component';
import { DeactivateGuard } from '../../interfaces/app.interface';

export interface BBSTopicForm {
    title: string;
    content: string;
    topic: number;
}

@Component({
    selector: 'app-topic-form',
    templateUrl: './topic-form.component.html',
    styleUrls: ['./topic-form.component.scss'],
})
export class TopicFormComponent extends UploadBaseComponent implements OnInit, OnDestroy {

    @Input() buttonText = 'SUBMIT';

    @Input() set data(input: BBSTopicById) {
        if (!!input) {
            this._data = input;

            const { node_id, title } = input;

            this.topic.patchValue(node_id);

            this.title.patchValue(title);
        }
    }

    /**
     * @ignore
     */
    private _data: BBSTopicById = null;

    /**
     * @ignore
     */
    get data(): BBSTopicById {
        return this._data;
    }

    @Output() emit: EventEmitter<BBSTopicForm> = new EventEmitter();

    /**
     * @ignore
     */
    @ViewChild(TopicContentEditComponent) contentComponent: TopicContentEditComponent;

    /**
     * @ignore
     */
    labelSm = 2;

    /**
     * @ignore
     */
    controlSm = 6;

    /**
     * @ignore
     */
    xs = 24;

    /**
     * @ignore
     */
    form: FormGroup;

    topics: Observable<GroupedList<BBSNode>[]>;

    /**
     * @ignore
     */
    isAlive = true;

    images: Observable<string>;

    private audit$: Subject<any> = new Subject();

    /**
     * @ignore
     */
    isLoading: boolean;

    constructor(
        private fb: FormBuilder,
        private communityService: CommunityService,
        public tipService: TipService,
        public changeRef: ChangeDetectorRef,
    ) {
        super(tipService, changeRef, communityService);

        this.initForm();
    }

    /**
     * @ignore
     */
    ngOnInit() {
        this.topics = this.communityService.getGroupedBBSNodes();

        this.images = this.url$.asObservable();

        this.communityService.isLoading().pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(isLoading => this.isLoading = isLoading);

        this.audit$.pipe(
            auditTime(200),
            takeWhile(() => this.isAlive)
        ).subscribe(_ => this.uploadFile());
    }

    /**
     * @ignore
     */
    initForm() {
        this.form = this.fb.group({
            title: ['', Validators.required],
            topic: [null, Validators.required],
        });
    }

    emitValue(): void {
        this.emit.next({ ...this.form.value, content: this.contentComponent.content });
    }

    beforeUpload = (file: UploadFile) => {
        this.files.push(file);

        this.audit$.next(null);

        return false;
    }

    /**
     * @ignore
     */
    canDeactivate(): DeactivateGuard[] {
        const dirty: DeactivateGuard = {
            canDeactivate: of(this.contentComponent.content === this.contentComponent.originContent && !this.form.dirty),
            message: 'DEPRECATE_UNSAVED_CHANGE_CONFIRM',
        };

        return [dirty];
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }

    /**
     * @ignore
     */
    get title(): AbstractControl {
        return this.form.get('title');
    }

    /**
     * @ignore
     */
    get topic(): AbstractControl {
        return this.form.get('topic');
    }
}
