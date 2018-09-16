import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { BaseMessage, APMMessage, BBSNotify } from '../../interfaces/response.interface';

type Message = BaseMessage & APMMessage & BBSNotify;

enum messageType {
    base,
    apm,
    bbs,
}

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
    @Input() set data(input: Message[]) {
        if (!input || !input.length) return;

        this.type = this.messageType(input);

        this._data = input;

        this.bcgColor = this.classMap[this.type];

        this.icon = this.iconMap[this.type];
    }

    private _data: Message[];

    get data(): Message[] {
        return this._data;
    }

    @Input() title: string;

    type: number;

    private classMap = ['#fab521', '#f04134', '#6d86fc'];

    bcgColor: string;

    private iconMap = ['bell', 'exclamation-circle-o', 'push-message'];

    icon: string;

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

    private messageType(messages: Message[]) {
        const msg = messages[0];

        if (msg.topic) {
            return messageType.bbs;
        } else if (msg.send_date) {
            return messageType.apm;
        } else {
            return messageType.base;
        }
    }

}
