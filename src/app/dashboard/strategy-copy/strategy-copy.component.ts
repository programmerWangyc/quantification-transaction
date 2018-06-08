import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';

import { BtNodeService } from '../../providers/bt-node.service';
import { StrategyOperateService } from '../../strategy/providers/strategy.operate.service';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';


@Component({
    selector: 'app-strategy-copy',
    templateUrl: './strategy-copy.component.html',
    styleUrls: ['./strategy-copy.component.scss']
})
export class StrategyCopyComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy {

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyOperateService,
        public nodeService: BtNodeService,
        public nzModal: NzModalService,
    ) {
        super(route, strategyService, nodeService, nzModal);
    }

    ngOnInit() {
        this.initialModel();

        this.launch(false);

        this.addCurrentPath('COPY');
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
