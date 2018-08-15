import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BBSNode } from '../../interfaces/response.interface';

interface PanelNode extends BBSNode {
    checked: boolean;
}

@Component({
    selector: 'app-nodes-panel',
    templateUrl: './nodes-panel.component.html',
    styleUrls: ['./nodes-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodesPanelComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() set nodes(input: BBSNode[]) {
        if (!!input) this._nodes = input.map(item => ({ ...item, checked: false }));
    }

    /**
     * @ignore
     */
    private _nodes: PanelNode[] = [];

    /**
     * @ignore
     */
    get data(): PanelNode[] {
        return this._nodes;
    }

    /**
     * @ignore
     */
    @Output() select: EventEmitter<BBSNode[]> = new EventEmitter();

    constructor() { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * Callback when node selected;
     */
    onNodeSelect(): void {
        this.select.next(this.data.filter(item => item.checked));
    }
}
