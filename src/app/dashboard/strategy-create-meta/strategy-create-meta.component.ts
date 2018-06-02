import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { find, map } from 'rxjs/operators';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Breadcrumb } from '../../interfaces/app.interface';
import { StrategyService } from '../../strategy/providers/strategy.service';

export interface Tab {
    name: string;
    icon: string;
    active: boolean;
}

@Component({
    selector: 'app-strategy-create-meta',
    templateUrl: './strategy-create-meta.component.html',
    styleUrls: ['./strategy-create-meta.component.scss']
})
export class StrategyCreateMetaComponent {

    subscription$$: Subscription;

    paths: Breadcrumb[] = [{ name: 'CONTROL_CENTER' }, { name: 'STRATEGY_LIBRARY', path: '../../' }];

    tabs: Tab[] = [
        { name: 'STRATEGY_EDIT', icon: 'anticon-edit', active: true },
        { name: 'SIMULATE_BACKTEST', icon: 'anticon-rocket', active: false }
    ];

    strategyName: Observable<string>;

    language: Observable<number>;

    category: Observable<number>;

    language$: Subject<number> = new Subject();

    category$: Subject<number> = new Subject();

    name$: Subject<number> = new Subject();

    strategyId: number;

    constructor(
        public route: ActivatedRoute,
        public strategyService: StrategyService,
    ) { }

    initialModel() {
        const id = +this.route.snapshot.paramMap.get('id');

        this.strategyId = id;

        const target = this.strategyService.getStrategies()
            .pipe(mergeMap(list => from(list)), find(item => item.id === id));

        this.strategyName = target.pipe(map(item => item.name));

        this.language = target.pipe(map(item => item.language));

        this.category = target.pipe(map(item => item.category));
    }

    launch() {
        this.subscription$$ = this.language$.subscribe(v => console.log('language', v))
            .add(this.category$.subscribe(v => console.log('category', v)))
            .add(this.name$.subscribe(v => console.log('name', v)))
    }

    addCurrentPath(name): void {
        this.paths.push({ name });
    }
}
