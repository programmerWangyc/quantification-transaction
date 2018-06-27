import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BtNode } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';

@Component({
    selector: 'app-dispense-options',
    templateUrl: './dispense-options.component.html',
    styleUrls: ['./dispense-options.component.scss']
})
export class DispenseOptionsComponent implements OnInit {

    @Input() selectedNode = 0;

    @Output() nodeChange: EventEmitter<number> = new EventEmitter();

    nodes: Observable<BtNode[]>;

    constructor(
        private nodeService: BtNodeService,
    ) { }

    ngOnInit() {
        this.initialModel();
    }

    initialModel() {
        this.nodes = this.nodeService.getNodeList()
            .pipe(
                map(nodes => [
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
            );
    }

}
