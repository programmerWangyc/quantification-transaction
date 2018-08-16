import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UploadFile } from 'ng-zorro-antd';
import { Observable, Subject } from 'rxjs';
import { auditTime, takeWhile } from 'rxjs/operators';

import { UploadBaseComponent } from '../../base/upload.component';
import { BBSNode } from '../../interfaces/response.interface';
import { TipService } from '../../providers/tip.service';
import { GroupedList } from '../../providers/util.service';
import { CommunityService } from '../providers/community.service';
import { TopicContentEditComponent } from '../topic-content-edit/topic-content-edit.component';

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

    /**
     * Submit button text;
     */
    @Input() buttonText = 'SUBMIT';

    /**
     * Edit mode origin title
     */
    @Input() originTitle: string;

    /**
     * Edit mode origin topic
     */
    @Input() originTopic: number;

    /**
     * Edit mode origin content;
     */
    @Input() originContent: string;

    /**
     * Submit flow
     */
    @Output() emit: EventEmitter<BBSTopicForm> = new EventEmitter();

    /**
     * @ignore
     */
    @ViewChild(TopicContentEditComponent) contentComponent: TopicContentEditComponent;

    /**
     * @ignore
     */
    labelSm = 6;

    /**
     * @ignore
     */
    controlSm = 14;

    /**
     * @ignore
     */
    xs = 24;

    /**
     * @ignore
     */
    form: FormGroup;

    /**
     * Available topics
     */
    topics: Observable<GroupedList<BBSNode>[]>;

    /**
     * @ignore
     */
    selectedTopic: number = null;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * Uploaded image's url
     */
    images: Observable<string>;

    /**
     * 钩子subject，zorro插入文件和上传动作发生前的中间件
     */
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
            topic: ['', Validators.required],
        });
    }

    /**
     * 输出表单的值
     */
    emitValue(): void {
        this.emit.next({ ...this.form.value, content: this.contentComponent.content });
    }

    /**
     * 覆盖基类上的方法，转为自动上传，主动调用上传方法，而非使用框架提供的自动上传方法，因此返回值仍是false；
     */
    beforeUpload = (file: UploadFile) => {
        this.files.push(file);

        this.audit$.next(null);

        return false;
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
