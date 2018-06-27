import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';

import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { StrategyService } from '../providers/strategy.service';

export interface TemplateRefItem {
    id: number;
    name: string;
    checked: boolean;
    isSnapshot: boolean;
    language: number;
}

@Component({
    selector: 'app-strategy-dependance',
    templateUrl: './strategy-dependance.component.html',
    styleUrls: ['./strategy-dependance.component.scss']
})
export class StrategyDependanceComponent implements OnInit, OnDestroy {
    @Input() set data(value: TemplateRefItem[]) {
        if (!value) return;

        this.source = value;

        this.change.next(value.filter(item => item.checked).map(item => item.id));
    }

    @Output() change: EventEmitter<number[]> = new EventEmitter();

    subscription$$: Subscription;

    source: TemplateRefItem[] = [];

    constructor(
        private nzModal: NzModalService,
        private strategyService: StrategyService,
    ) { }

    ngOnInit() {
        this.launch();
    }

    launch() {
        this.subscription$$ = this.strategyService.updateSelectedTemplates(this.change.pipe(startWith([])));
    }

    onChange(target: TemplateRefItem): void {
        if (target.isSnapshot && !target.checked) {
            this.nzModal.warning({
                nzContent: SimpleNzConfirmWrapComponent,
                nzComponentParams: { content: 'RELEASE_SNAPSHOT_TEMPLATE_REFERENCE_WARNING', params: { name: target.name } },
                nzCancelText: null,
                nzOnOk: () => this.emit()
            });
        } else {
            this.emit();
        }
    }

    emit(): void {
        this.change.next(this.source.filter(item => item.checked).map(item => item.id));
    }

    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
