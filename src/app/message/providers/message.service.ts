import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription, merge } from 'rxjs';
import { takeWhile, map, distinctUntilChanged } from 'rxjs/operators/';

import { BaseService } from '../../base/base.service';
import * as fromReq from '../../interfaces/request.interface';
import * as fromRes from '../../interfaces/response.interface';
import { ErrorService } from '../../providers/error.service';
import { ProcessService } from '../../providers/process.service';
import * as fromRoot from '../../store/index.reducer';

@Injectable()
export class MessageService extends BaseService {
    constructor(
        private store: Store<fromRoot.AppState>,
        private process: ProcessService,
        private errorService: ErrorService,
    ) {
        super();
    }

    //  =======================================================Serve Request=======================================================

    /**
     * @ignore
     */
    launchGetMessage(params: Observable<fromReq.GetMessageRequest>): Subscription {
        return this.process.processGetMessage(params);
    }

    /**
     * @ignore
     */
    launchDeleteMessage(params: Observable<fromReq.DeleteMessageRequest>): Subscription {
        return this.process.processDeleteMessage(params);
    }

    /**
     * @ignore
     */
    launchGetBBSNotify(params: Observable<fromReq.GetBBSNotifyRequest>): Subscription {
        return this.process.processGetBBSNotify(params);
    }

    /**
     * @ignore
     */
    launchDeleteBBSNotify(params: Observable<fromReq.DeleteBBSNotifyRequest>): Subscription {
        return this.process.processDeleteBBSNotify(params);
    }

    /**
     * @ignore
     */
    launchGetAPMMessage(params: Observable<fromReq.GetAPMMessageRequest>): Subscription {
        return this.process.processGetAPMMessage(params);
    }

    /**
     * @ignore
     */
    launchDeleteAPMMessage(params: Observable<fromReq.DeleteAPMMessageRequest>): Subscription {
        return this.process.processDeleteAPMMessage(params);
    }

    //  =======================================================Data acquisition=======================================================

    /**
     * @ignore
     */
    private getMessageResponse(): Observable<fromRes.GetMessageResponse> {
        return this.store.pipe(
            select(fromRoot.selectGetMessageResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getMessageResult(): Observable<fromRes.BaseMessage[]> {
        return this.getMessageResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * @ignore
     */
    hasSNS(): Observable<boolean> {
        return merge(
            this.getMessageResponse(),
            this.getAPMMessageResponse()
        ).pipe(
            map(res => res.result.sns),
            distinctUntilChanged()
        );
    }

    /**
     * @ignore
     */
    private getAPMMessageResponse(): Observable<fromRes.GetAPMMessageResponse> {
        return this.store.pipe(
            select(fromRoot.selectGetAPMMessageResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getAPMMessageResult(): Observable<fromRes.APMMessage[]> {
        return this.getAPMMessageResponse().pipe(
            map(res => res.result.items)
        );
    }


    /**
     * @ignore
     */
    private getBBSNotifyResponse(): Observable<fromRes.GetBBSNotifyResponse> {
        return this.store.pipe(
            select(fromRoot.selectGetBBSNotifyResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    getBBSNotifyResult(): Observable<fromRes.BBSNotify[]> {
        return this.getBBSNotifyResponse().pipe(
            map(res => res.result.items)
        );
    }

    /**
     * @ignore
     */
    private getDeleteMessageResponse(): Observable<fromRes.DeleteMessageResponse> {
        return this.store.pipe(
            select(fromRoot.selectDeleteMessageResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    private getDeleteAPMMessageResponse(): Observable<fromRes.DeleteAPMMessageResponse> {
        return this.store.pipe(
            select(fromRoot.selectDeleteAPMMessageResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    private getDeleteBBSNotifyResponse(): Observable<fromRes.DeleteBBSNotifyResponse> {
        return this.store.pipe(
            select(fromRoot.selectDeleteBBSNotifyResponse),
            this.filterTruth()
        );
    }

    //  =======================================================UI state =======================================================

    //  =======================================================Local state change=======================================================

    //  =======================================================Error handler=======================================================

    /**
     * @ignore
     */
    handleGetMessageError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getMessageResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleGetAPMMessageError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getAPMMessageResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleBBSNotifyError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getBBSNotifyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteMessageError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getDeleteMessageResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteAPMMessageError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getDeleteAPMMessageResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    /**
     * @ignore
     */
    handleDeleteBBSNotifyError(keepAlive: () => boolean): Subscription {
        return this.errorService.handleResponseError(this.getDeleteBBSNotifyResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}
