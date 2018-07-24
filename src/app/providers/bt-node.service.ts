import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { GetNodeListResponse, DeleteNodeResponse } from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { BtNode } from '../interfaces/response.interface';
import { AppState } from '../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { GroupedList, UtilService } from './util.service';
import { BaseService } from '../base/base.service';
import { UIState } from '../store/bt-node/bt-node.reducer';


export interface GroupedNode extends GroupedList<BtNode> {
    groupNameValue?: any;
}

export interface NodeFilterFn {
    (node: BtNode): boolean;
}

@Injectable()
export class BtNodeService extends BaseService {

    constructor(
        private store: Store<AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private utilService: UtilService,
    ) {
        super();
    }

    // =======================================================Serve Request=======================================================

    /**
     * Request node list from server.
     */
    launchGetNodeList(data: Observable<any>, allowSeparateRequest?: boolean): Subscription {
        return this.process.processGetNodeList(data, allowSeparateRequest);
    }

    /**
     * Delete node
     */
    launchDeleteNode(node: Observable<BtNode>): Subscription {
        return this.process.processDeleteNode(node.pipe(
            map(({ id }) => ({ id }))
        ));
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
            map(state => state.isLoading)
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

