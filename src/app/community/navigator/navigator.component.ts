import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation
} from '@angular/core';

import { BBSNode, BBSPlane } from '../../interfaces/response.interface';

interface Plane extends BBSPlane {
    checked: boolean;
}

@Component({
    selector: 'app-navigator',
    templateUrl: './navigator.component.html',
    styleUrls: ['./navigator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NavigatorComponent implements OnInit {

    /**
     * BBS planes;
     */
    @Input() set planes(input: BBSPlane[]) {
        if (!!input) {
            this._data = input.map(item => ({ ...item, checked: false }));
        }
    }

    /**
     * @ignore
     */
    private _data: Plane[] = [];

    /**
     * @ignore
     */
    get data(): Plane[] {
        return this._data;
    }

    /**
     * BBS nodes
     */
    @Input() nodes: BBSNode[];

    /**
     * Emit selected tag;
     */
    @Output() select: EventEmitter<string> = new EventEmitter();

    /**
     * Activated nodes;
     */
    activatedNodes: BBSNode[] = [];

    /**
     * Default 0 means select all type;
     */
    selectedPlane = 0;

    constructor(
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * Callback when plane selected;
     */
    onPlaneSelected(id: number): void {
        if (!!id) {
            this.activatedNodes = this.nodes.filter(node => node.plane_id === id);

            this.select.next(this.createSlugStr(this.activatedNodes));
        } else {
            this.activatedNodes = [];

            this.select.next('');
        }
    }

    /**
     * Receive selected nodes of node panel;
     */
    onNodeSelect(nodes: BBSNode[]): void {
        if (nodes.length) {
            this.select.next(this.createSlugStr(nodes));
        } else {
            this.select.next(this.createSlugStr(this.activatedNodes));
        }
    }

    /**
     * @ignore
     */
    private createSlugStr(nodes: BBSNode[]): string {
        return nodes[nodes.length - 1].slug;
        // return nodes.map(item => item.slug).join(',');
    }
}
