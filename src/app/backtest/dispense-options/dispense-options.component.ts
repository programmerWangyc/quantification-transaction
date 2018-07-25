import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BtNode } from '../../interfaces/response.interface';
import { BtNodeService } from '../../providers/bt-node.service';

@Component({
    selector: 'app-dispense-options',
    templateUrl: './dispense-options.component.html',
    styleUrls: ['./dispense-options.component.scss'],
})
export class DispenseOptionsComponent implements OnInit {

    /**
     * Id of node;
     */
    @Input() selectedNode = 0;

    /**
     * Output the node id if changed;
     */
    @Output() nodeChange: EventEmitter<number> = new EventEmitter();

    /**
     * Source data of node;
     */
    nodes: Observable<BtNode[]>;

    constructor(
        private nodeService: BtNodeService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();
    }

    /**
     * @ignore
     */
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
                    ...nodes.filter(node => node.is_owner && node.online),
                ])
            );
    }

}
