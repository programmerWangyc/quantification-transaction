import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { GetNodeListResponse } from '../interfaces/response.interface';
import * as fromRoot from '../store/index.reducer';
import { BtNode } from './../interfaces/response.interface';
import { AppState } from './../store/index.reducer';
import { ErrorService } from './error.service';
import { ProcessService } from './process.service';
import { GroupedList, UtilService } from './util.service';


export interface GroupedNode extends GroupedList<BtNode> {
    groupNameValue?: any;
}

export interface NodeFilterFn {
    (node: BtNode): boolean;
}

@Injectable()
export class BtNodeService {

    constructor(
        private store: Store<AppState>,
        private error: ErrorService,
        private process: ProcessService,
        private utilService: UtilService,
    ) { }

    /* =======================================================Serve Request======================================================= */

    /**
     * Request node list from server.
     */
    launchGetNodeList(data: Observable<any>, allowSeparateRequest?: boolean): Subscription {
        return this.process.processGetNodeList(data, allowSeparateRequest);
    }

    /* =======================================================Date Acquisition======================================================= */

    /**
     * Get node list response.
     */
    private getNodeListResponse(): Observable<GetNodeListResponse> {
        return this.store.select(fromRoot.selectBtNodeListResponse)
            .pipe(
                filter(res => !!res)
            );
    }

    /**
     * Select nodes from node list response;
     */
    getNodeList(): Observable<BtNode[]> {
        return this.getNodeListResponse()
            .pipe(
                map(res => res.result.nodes)
            );
    }

    /**
     * @param getName  The method to generate group name.
     * @param key The key used to distinct data.
     * 获取分组后的 node list.
     */
    getGroupedNodeList(key: string, getName?: (arg: number | boolean) => string): Observable<GroupedNode[]> {
        return this.utilService.getGroupedList(this.getNodeList(), key, getName);
    }

    /**
     * @param id  Node id.
     * 生成代理节点的名称。
     */
    getAgentName(id: number): string {
        return id === 0 ? 'PRIVATE_AGENT' : 'PUBLIC_AGENT';
    }

    /**
     * @param str 代理节点的名称。
     * 根据代理节点的名称获取它的id。
     */
    reverseGetAgentName(str: string): number {
        return str === 'PRIVATE_AGENT' ? 0 : 1;
    }

    /**
     * Predicate whether the node is public node.
     */
    isPublicNode(nodeId: number): Observable<boolean> {
        return this.getNodeList()
            .pipe(
                map(list => {
                    const target = list.find(item => item.id === nodeId);

                    return !!target.public;
                })
            );
    }

    /**
     * @param conditions Collection of predicate functions;
     * 获取符合条件的节点集合。
     */
    getSpecificNodeList(...conditions: NodeFilterFn[]): Observable<BtNode[]> {
        return this.getNodeList()
            .pipe(
                map(list => list.filter(item => conditions.reduce((acc, cur) => acc && cur(item), true)))
            );
    }

    /* =======================================================Shortcut methods======================================================= */

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

    /* =======================================================Error Handle======================================================= */

    /**
     * Handle the error of node list request.
     */
    handleNodeListError(): Subscription {
        return this.error.handleResponseError(this.getNodeListResponse());
    }
}
