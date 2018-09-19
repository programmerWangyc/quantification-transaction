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
        if (!!input) this._nodes = input.map((item, index) => ({ ...item, checked: index === 0 }));
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
     * Disport multi query;
     * 发数组出去，方便扩展多节点查询
     */
    onNodeSelect(target: PanelNode): void {
        this.data.map(item => {
            if (item !== target) {
                item.checked = false;
            }
        });

        this.select.next([target]);
    }
}
