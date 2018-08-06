import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

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
     * Emit replay content;
     */
    @Output() reply: EventEmitter<string> = new EventEmitter();

    /**
     * Emit comment content;
     */
    @Output() comment: EventEmitter<string> = new EventEmitter();

    /**
     * @ignore
     */
    content = '';

    /**
     * textarea size
     */
    size = { minRows: 5, maxRows: 20 };

    constructor() { }

    ngOnInit() {
    }

    uploadFile() {
        console.log('upload file now');
    }
}
