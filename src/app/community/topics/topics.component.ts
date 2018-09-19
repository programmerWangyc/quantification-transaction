import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { BBSNode, BBSTopic } from '../../interfaces/response.interface';
import { PublicService } from '../../providers/public.service';
import { take } from 'rxjs/operators';

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

    username: string;

    icons = {
        1: 'alternating',
        2: 'alternating',
        3: 'alternating',
        4: 'alternating',
        5: 'alternating',
        6: 'official',
        10: 'official',
        11: 'tutorial',
        12: 'tutorial',
        13: 'tutorial',
        14: 'tutorial',
    };

    constructor(
        private publicService: PublicService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.publicService.getCurrentUser().pipe(
            take(1)
        ).subscribe(username => this.username = username);
    }

    /**
     * @ignore
     */
    nodeName(id: number): string {
        return this.nodes.find(item => item.id === id).name;
    }
}
