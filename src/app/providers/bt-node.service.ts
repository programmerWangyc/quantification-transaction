import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

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

    launchGetNodeList(data: Observable<any>, allowSeparateRequest?: boolean): Subscription {
        return this.process.processGetNodeList(data, allowSeparateRequest);
    }

    /* =======================================================Date Acquisition======================================================= */

    private getNodeListResponse(): Observable<GetNodeListResponse> {
        return this.store.select(fromRoot.selectBtNodeListResponse)
            .filter(res => !!res);
    }

    getNodeList(): Observable<BtNode[]> {
        return this.getNodeListResponse().pipe(
            map(res => res.result.nodes));
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
            }))
    }

    getSpecificNodeList(...conditions: NodeFilterFn[]): Observable<BtNode[]> {
        return this.getNodeList().pipe(map(list => list.filter(item => conditions.reduce((acc, cur) => acc && cur(item), true))));
    }

    /* =======================================================Shortcut methods======================================================= */

    isMineNode(node: BtNode): boolean {
        return node.is_owner;
    }

    isLatestFunctionalNode(node: BtNode): boolean {
        return node.version.indexOf('plugin') !== -1;
    }

    /* =======================================================Error Handle======================================================= */

    handleNodeListError(): Subscription {
        return this.error.handleResponseError(this.getNodeListResponse());
    }
}
