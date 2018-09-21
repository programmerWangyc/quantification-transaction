import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { last } from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { keepAliveFn } from '../interfaces/app.interface';
import { BtNode, DeleteNodeResponse, GetNodeListResponse } from '../interfaces/response.interface';
import { UIState } from '../store/bt-node/bt-node.reducer';
import * as fromRoot from '../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { TipService } from './tip.service';
import { GroupedList, UtilService } from './util.service';

export interface GroupedNode extends GroupedList<BtNode> {
    groupNameValue?: any;
}

export type NodeFilterFn = (node: BtNode) => boolean;

@Injectable()
export class BtNodeService extends BaseService {

    constructor(
        private store: Store<fromRoot.AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private utilService: UtilService,
        private httpClient: HttpClient,
        private tipService: TipService,
    ) {
        super();
    }

    // =======================================================Serve Request=======================================================

    launchGetNodeList(data: Observable<any>): Subscription {
        return this.process.processGetNodeList(data);
    }

    launchDeleteNode(node: Observable<BtNode>): Subscription {
        return this.process.processDeleteNode(node.pipe(
            map(({ id }) => ({ id }))
        ));
    }

    launchNodeHash(start: Observable<any>): Subscription {
        return this.process.processGetNodeHash(start);
    }

    launchDownloadPackage(uri: Observable<string>): Subscription {
        return uri.pipe(
            switchMap(url => this.httpClient.get(url, { responseType: 'blob' }).pipe(
                map(file => ({ file, fileName: last(url.split('/')) }))
            ))
        )
            .subscribe(({ file, fileName }) => {
                const url = window.URL.createObjectURL(file);

                const a = document.createElement('a');

                document.body.appendChild(a);

                a.setAttribute('style', 'display: none');

                a.href = url;

                a.download = fileName;

                a.click();

                window.URL.revokeObjectURL(url);

                a.remove();
            });
    }

    private getNodeListResponse(): Observable<GetNodeListResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectBtNodeListResponse)
        );
    }

    getNodeList(): Observable<BtNode[]> {
        return this.getNodeListResponse().pipe(
            map(res => res.result.nodes)
        );
    }

    getGroupedNodeList(key: string, getName?: (arg: number | boolean) => string): Observable<GroupedNode[]> {
        return this.utilService.getGroupedList(this.getNodeList(), key, getName);
    }

    getAgentName(id: number): string {
        return id === 0 ? 'PRIVATE_AGENT' : 'PUBLIC_AGENT';
    }

    reverseGetAgentName(str: string): number {
        return str === 'PRIVATE_AGENT' ? 0 : 1;
    }

    isPublicNode(nodeId: number): Observable<boolean> {
        return this.getNodeList().pipe(
            map(list => {
                const target = list.find(item => item.id === nodeId);

                return !!target.public;
            })
        );
    }

    getSpecificNodeList(...conditions: NodeFilterFn[]): Observable<BtNode[]> {
        return this.getNodeList().pipe(
            map(list => list.filter(item => conditions.reduce((acc, cur) => acc && cur(item), true)))
        );
    }

    private getDeleteNodeResponse(): Observable<DeleteNodeResponse> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectDeleteNodeResponse)
        );
    }

    private getNodeUIState(): Observable<UIState> {
        return this.store.pipe(
            select(fromRoot.selectBtNodeUIState),
        );
    }

    isLoading(): Observable<boolean> {
        return this.getNodeUIState().pipe(
            map(state => state.isLoading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    getNodeHash(): Observable<string> {
        return this.store.pipe(
            this.selectTruth(fromRoot.selectNodeHashResponse),
            map(res => res.result)
        );
    }


    isMineNode(node: BtNode): boolean {
        return node.is_owner;
    }

    isLatestFunctionalNode(node: BtNode): boolean {
        return node.version.indexOf('plugin') !== -1;
    }

    handleNodeListError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getNodeListResponse().pipe(
            takeWhile(keepAlive)
        ));
    }

    handleDeleteNodeError(keepAlive: keepAliveFn): Subscription {
        return this.error.handleResponseError(this.getDeleteNodeResponse().pipe(
            takeWhile(keepAlive)
        ));
    }
}

