import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { BtNode } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';

@Component({
    selector: 'app-dispense-options',
    templateUrl: './dispense-options.component.html',
    styleUrls: ['./dispense-options.component.scss']
})
export class DispenseOptionsComponent implements OnInit {

    nodes: Observable<BtNode[]>;

    selectedNode = 0;

    @Output() nodeChange: EventEmitter<number> = new EventEmitter();

    constructor(
        private nodeService: BtNodeService,
    ) { }

    ngOnInit() {
        this.initialModel();
    }

    initialModel() {
        this.nodes = this.nodeService.getNodeList()
            .map(nodes => [
                {
                    build: '',
                    city: '',
                    date: '',
                    id: 0,
                    ip: '',
                    is_owner: true,
                    loaded: NaN,
                    name: 'BOTVS_CLOUD_SERVER_COLLECTION',
                    online: true,
                    os: '',
                    public: NaN,
                    region: '',
                    version: '',
                    wd: NaN,
                },
                ...nodes.filter(node => node.is_owner && node.online)
            ])
    }

}
