import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { PublicService } from '../../providers/public.service';

@Component({
    selector: 'app-reply',
    templateUrl: './reply.component.html',
    styleUrls: ['./reply.component.scss'],
})
export class ReplyComponent implements OnInit {

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
     * textarea size
     */
    size = { minRows: 5, maxRows: 20 };

    isLogin: Observable<boolean>;

    constructor(
        private publicService: PublicService,
    ) { }

    ngOnInit() {
        this.isLogin = this.publicService.isLogin();
    }

    uploadFile() {
        console.log('upload file now');
    }
}
