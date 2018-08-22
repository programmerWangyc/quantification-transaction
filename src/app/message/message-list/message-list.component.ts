import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { BaseMessage, APMMessage, BBSNotify } from '../../interfaces/response.interface';

type Message = BaseMessage | APMMessage | BBSNotify;

@Component({
    selector: 'app-message-list',
    templateUrl: './message-list.component.html',
    styleUrls: ['./message-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageListComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() data: Message[];

    /**
     * 清空的时候 -1；
     */
    @Output() delete: EventEmitter<number> = new EventEmitter();

    constructor() { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

}
