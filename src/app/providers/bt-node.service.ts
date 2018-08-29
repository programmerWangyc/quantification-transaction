import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { BaseService } from '../base/base.service';
import { BtNode, DeleteNodeResponse, GetNodeListResponse } from '../interfaces/response.interface';
import { UIState } from '../store/bt-node/bt-node.reducer';
import * as fromRoot from '../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { GroupedList, UtilService } from './util.service';
import { HttpClient } from '@angular/common/http';
import { last } from 'lodash';
import { TipService } from './tip.service';

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

    /**
     * Request node list from server.
     */
    launchGetNodeList(data: Observable<any>): Subscription {
        return this.process.processGetNodeList(data);
    }

    /**
     * Delete node
     */
    launchDeleteNode(node: Observable<BtNode>): Subscription {
        return this.process.processDeleteNode(node.pipe(
            map(({ id }) => ({ id }))
        ));
    }

    /**
     * get node hash
     */
    launchNodeHash(start: Observable<any>): Subscription {
        return this.process.processGetNodeHash(start);
    }

    /**
     * 下载agent package
     */
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

    // =======================================================Date Acquisition=======================================================

    /**
     * Get node list response.
     */
    private getNodeListResponse(): Observable<GetNodeListResponse> {
        return this.store.select(fromRoot.selectBtNodeListResponse).pipe(
            this.filterTruth()
        );
    }

    /**
     * Select nodes from node list response;
     */
    getNodeList(): Observable<BtNode[]> {
        return this.getNodeListResponse().pipe(
            map(res => res.result.nodes)
        );
    }

    /**
     * 获取分组后的 node list.
     * @param getName  The method to generate group name.
     * @param key The key used to distinct data.
     */
    getGroupedNodeList(key: string, getName?: (arg: number | boolean) => string): Observable<GroupedNode[]> {
        return this.utilService.getGroupedList(this.getNodeList(), key, getName);
    }

    /**
     * 生成代理节点的名称。
     * @param id  Node id.
     */
    getAgentName(id: number): string {
        return id === 0 ? 'PRIVATE_AGENT' : 'PUBLIC_AGENT';
    }

    /**
     * 根据代理节点的名称获取它的id。
     * @param str 代理节点的名称。
     */
    reverseGetAgentName(str: string): number {
        return str === 'PRIVATE_AGENT' ? 0 : 1;
    }

    /**
     * Predicate whether the node is public node.
     */
    isPublicNode(nodeId: number): Observable<boolean> {
        return this.getNodeList().pipe(
            map(list => {
                const target = list.find(item => item.id === nodeId);

                return !!target.public;
            })
        );
    }

    /**
     * 获取符合条件的节点集合。
     * @param conditions Collection of predicate functions;
     */
    getSpecificNodeList(...conditions: NodeFilterFn[]): Observable<BtNode[]> {
        return this.getNodeList().pipe(
            map(list => list.filter(item => conditions.reduce((acc, cur) => acc && cur(item), true)))
        );
    }

    /**
     * @ignore
     */
    private getDeleteNodeResponse(): Observable<DeleteNodeResponse> {
        return this.store.pipe(
            select(fromRoot.selectDeleteNodeResponse),
            this.filterTruth()
        );
    }

    /**
     * @ignore
     */
    private getNodeUIState(): Observable<UIState> {
        return this.store.pipe(
            select(fromRoot.selectBtNodeUIState),
        );
    }

    /**
     * 是否正在加载托管者列表
     */
    isLoading(): Observable<boolean> {
        return this.getNodeUIState().pipe(
            map(state => state.isLoading),
            this.loadingTimeout(this.tipService.loadingSlowlyTip)
        );
    }

    /**
     * node hash
     */
    getNodeHash(): Observable<string> {
        return this.store.pipe(
            select(fromRoot.selectNodeHashResponse),
            this.filterTruth(),
            map(res => res.result)
        );
    }

    // =======================================================Shortcut methods=======================================================

    /**
     * Predicate whether the node is main node.
     */
    isMineNode(node: BtNode): boolean {
        return node.is_owner;
    }

    /**
     * Whether the node is latest available node.
     */
    isLatestFunctionalNode(node: BtNode): boolean {
        return node.version.indexOf('plugin') !== -1;
    }

    // =======================================================Error Handle==========================================================

    /**
     * Handle the error of node list request.
     */
    handleNodeListError(): Subscription {
        return this.error.handleResponseError(this.getNodeListResponse());
    }

    /**
     * @ignore
     */
    handleDeleteNodeError(): Subscription {
        return this.error.handleResponseError(this.getDeleteNodeResponse());
    }
}

