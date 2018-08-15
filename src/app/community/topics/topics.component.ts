import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { BBSNode, BBSTopic } from '../../interfaces/response.interface';

interface Color {
    [key: number]: string;
}

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() topics: BBSTopic[] = [];

    /**
     * @ignore
     */
    @Input() nodes: BBSNode[] = [];

    color: Color = {
        1: 'cyan',
        2: 'blue',
        3: 'geekblue',
        4: 'purple',
        5: 'lime',
        6: 'gold',
        10: 'orange',
        11: 'volcano',
        12: 'red',
        13: 'magenta',
        14: '#108ee9',
    };

    constructor(
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
    nodeName(id: number): string {
        return this.nodes.find(item => item.id === id).name;
    }
}
