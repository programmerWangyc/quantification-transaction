import {
    AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2,
    ViewEncapsulation, OnDestroy
} from '@angular/core';

import { merge, Observable } from 'rxjs';

import { UploadBaseComponent } from '../../base/upload.component';
import { PublicService } from '../../providers/public.service';
import { TipService } from '../../providers/tip.service';
import { CommentService } from '../providers/comment.service';
import { takeWhile } from 'rxjs/operators';

@Component({
    selector: 'app-reply',
    templateUrl: './reply.component.html',
    styleUrls: ['./reply.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ReplyComponent extends UploadBaseComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() buttonText = 'REPLY';

    @Input() row = 5;

    @Input() username: string;

    @Input() showBanner = false;

    @Output() send: EventEmitter<string> = new EventEmitter();

    @Input() content = '';

    @Input() set clear(input: boolean) {
        if (input) {
            this.content = '';
        }
    }

    size = { minRows: 5, maxRows: 20 };

    isLogin: Observable<boolean>;

    disableReplyBtn: Observable<boolean>;

    isAlive = true;

    constructor(
        private publicService: PublicService,
        private render2: Renderer2,
        private eleRef: ElementRef<any>,
        public commentService: CommentService,
        public tipService: TipService,
        public changeRef: ChangeDetectorRef,
    ) {
        super(tipService, changeRef, commentService);
    }

    ngOnInit() {
        this.isLogin = this.publicService.isLogin();

        this.disableReplyBtn = merge(
            this.uploading$,
            this.commentService.isLoading()
        );

        this.url$.pipe(
            takeWhile(() => this.isAlive)
        ).subscribe(url => {
            this.content = !!this.content ? this.content + ' ' + url + ' ' : url;
        });
    }

    ngAfterViewInit() {
        if (this.showBanner) {
            const ele = this.eleRef.nativeElement.querySelector('.ant-upload-drag');

            this.render2.setStyle(ele, 'border-radius', '0');
        }
    }

    ngOnDestroy() {
        this.isAlive = false;
    }
}
