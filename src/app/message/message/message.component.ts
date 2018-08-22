import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../providers/message.service';
import { Breadcrumb } from '../../interfaces/app.interface';
import { Observable, of } from 'rxjs';
import { BaseMessage, APMMessage, BBSNotify } from '../../interfaces/response.interface';
import { takeWhile } from 'rxjs/operators';

export interface Tab {
    name: string;
    icon: string;
    count: number;
}

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit, OnDestroy {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'MESSAGE_CENTER' }];

    /**
     * @ignore
     */
    message: Observable<BaseMessage[]>;

    /**
     * @ignore
     */
    apmMessage: Observable<APMMessage[]>;

    /**
     * @ignore
     */
    bbsNotify: Observable<BBSNotify[]>;

    /**
     * @ignore
     */
    isAlive = true;

    /**
     * @ignore
     */
    activateTabIndex = 0;

    /**
     * @ignore
     */
    tabs: Tab[] = [
        { name: 'INNER_MESSAGE', icon: 'anticon-message', count: 0 },
        { name: 'PUSHED_MESSAGE', icon: 'anticon-notification', count: 0  },
        { name: 'WARNING_MESSAGE', icon: 'anticon-warning', count: 0 },
    ];

    /**
     * @ignore
     */
    hasSNS: Observable<boolean>;

    constructor(
        private messageService: MessageService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();

        this.launch();

        this.setBadgeCount();
    }

    /**
     * @ignore
     */
    private initialModel(): void {
        this.message = this.messageService.getMessageResult();

        this.apmMessage = this.messageService.getAPMMessageResult();

        this.bbsNotify = this.messageService.getBBSNotifyResult();

        this.hasSNS = this.messageService.hasSNS();
    }

    /**
     * @ignore
     */
    private launch(): void {
        this.messageService.launchGetMessage(of({ offset: -1, limit: -1 }));

        this.messageService.launchGetAPMMessage(of({ offset: -1, limit: -1 }));

        this.messageService.launchGetBBSNotify(of({ offset: -1, limit: -1 }));
    }

    /**
     * @ignore
     */
    private setBadgeCount(): void {
        const keepAlive = () => this.isAlive;

        this.message.pipe(
            takeWhile(keepAlive)
        ).subscribe(list => this.tabs[1].count = list.length);

        this.apmMessage.pipe(
            takeWhile(keepAlive)
        ).subscribe(list => this.tabs[2].count = list.length);

        this.bbsNotify.pipe(
            takeWhile(keepAlive)
        ).subscribe(list => this.tabs[0].count = list.length);
    }

    /**
     * @ignore
     */
    onRefresh(): void {
        this.launch();
    }

    /**
     * @ignore
     */
    deleteMessage(id: number): void {
        this.messageService.launchDeleteMessage(of({ id }));
    }

    /**
     * @ignore
     */
    deleteAPMMessage(id: number): void {
        this.messageService.launchDeleteAPMMessage(of({ id }));
    }

    /**
     * @ignore
     */
    deleteBBSNotify(id: number): void {
        this.messageService.launchDeleteBBSNotify(of({ id }));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.isAlive = false;
    }
}
