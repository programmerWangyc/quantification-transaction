import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StrategyService } from '../../strategy/providers/strategy.service';
import { StrategyCreateMetaComponent } from '../strategy-create-meta/strategy-create-meta.component';


@Component({
    selector: 'app-strategy-copy',
    templateUrl: './strategy-copy.component.html',
    styleUrls: ['./strategy-copy.component.scss']
})
export class StrategyCopyComponent extends StrategyCreateMetaComponent implements OnInit, OnDestroy {

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyService,
    ) {
        super(route, strategyService);
    }

    ngOnInit() {
        this.initialModel();

        this.launch();

        this.addCurrentPath('COPY');
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
