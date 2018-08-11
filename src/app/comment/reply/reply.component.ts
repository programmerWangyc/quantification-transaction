import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2,
    ViewEncapsulation
} from '@angular/core';

import { UploadFile } from 'ng-zorro-antd';
import { from, merge, Observable, Subject } from 'rxjs';
import { delay, map, timeout } from 'rxjs/operators';

import { CommentService } from '../providers/comment.service';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';

@Component({
    selector: 'app-reply',
    templateUrl: './reply.component.html',
    styleUrls: ['./reply.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ReplyComponent implements OnInit, AfterViewInit {

    /**
     * button text
     */
    @Input() buttonText = 'REPLY';

    /**
     * row
     */
    @Input() row = 5;

    /**
     * User name;
     */
    @Input() username: string;

    /**
     * 是否显示标题栏
     */
    @Input() showBanner = false;

    /**
     * Send content
     */
    @Output() send: EventEmitter<string> = new EventEmitter();

    /**
     * @ignore
     */
    @Input() content = '';

    /**
     * Clear content
     */
    @Input() set clear(input: boolean) {
        if (input) {
            this.content = '';
        }
    }

    /**
     * textarea size
     */
    size = { minRows: 5, maxRows: 20 };

    /**
     * Whether the user had login;
     */
    isLogin: Observable<boolean>;

    /**
     * 需要上传的文件
     */
    files: UploadFile[] = [];

    /**
     * Upload file amount limit;
     */
    limit = 5;

    /**
     * @ignore
     */
    allowedContentTypes = 'image/jpg, image/png, image/jpeg, image/gif';

    /**
     * 是否正在上传
     */
    uploading$: Subject<boolean> = new Subject();

    /**
     * 上传完成的图片数量
     */
    private uploadedCount = 0;

    /**
     * 禁用回复按钮
     */
    disableReplyBtn: Observable<boolean>;

    /**
     * @ignore
     */
    private urlPrefix: string = location.protocol === 'https' ? 'https://dn-filebox.qbox.me/' : 'http://7xi2n7.com1.z0.glb.clouddn.com/';

    constructor(
        private publicService: PublicService,
        private commentService: CommentService,
        private tipService: TipService,
        private changeRef: ChangeDetectorRef,
        private render2: Renderer2,
        private eleRef: ElementRef<any>,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.isLogin = this.publicService.isLogin();

        this.disableReplyBtn = merge(
            this.uploading$,
            this.commentService.isLoading()
        );
    }

    /**
     * @ignore
     */
    ngAfterViewInit() {
        if (this.showBanner) {
            const ele = this.eleRef.nativeElement.querySelector('.ant-upload-drag');

            this.render2.setStyle(ele, 'border-radius', '0');
        }
    }

    /**
     * @ignore
     */
    beforeUpload = (file: UploadFile) => {
        this.files.push(file);

        return false;
    }

    /**
     * 上传文件
     */
    uploadFile() {
        this.commentService.launchQiniuToken(from(this.files).pipe(
            map(({ name }) => ({ name }))
        ));

        this.commentService.uploadImage(from(this.files).pipe(
            delay(100)
        )).pipe(
            timeout(10000)
        ).subscribe(
            engine => engine.obs.subscribe(this.createUploadObserver()),
            err => this.tokenError(err),
            () => this.commentService.clearQiniuToken()
        );

        this.uploading$.next(true);
    }

    /**
     * @ignore;
     */
    private tokenError(error: any): void {
        this.reset();
        this.tipService.messageError('IMAGE_TOKEN_ERROR_OR_TIMEOUT');
        this.tipService.messageInfo(error);
    }

    /**
     * Get upload image observer;
     */
    private createUploadObserver(): Qiniu.Observer {
        return {
            next: _ => { },
            error: err => {
                this.tipService.messageError('IMAGE_UPLOAD_ERROR');

                this.tipService.messageError(err.message);
            },
            complete: obj => {
                this.insertImage(obj.key);

                this.uploadedCount += 1;

                if (this.uploadedCount === this.files.length) {
                    this.reset();
                }
            },
        };
    }

    /**
     * 当前内容中插入图片地址；
     */
    private insertImage(key: string): void {
        const url = this.urlPrefix + key;

        this.content = !!this.content ? this.content + ' ' + url + ' ' : url;
    }

    /**
     * @ignore
     */
    private reset(): void {
        this.uploading$.next(false);

        this.uploadedCount = 0;

        this.files = [];

        this.changeRef.detectChanges();
    }
}
