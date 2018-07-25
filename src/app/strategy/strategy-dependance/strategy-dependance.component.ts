import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { NzModalService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/internal/operators/startWith';

import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';
import { StrategyService } from '../providers/strategy.service';

/**
 * 策略可以引用的模板依赖
 */
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
    styleUrls: ['./strategy-dependance.component.scss'],
})
export class StrategyDependanceComponent implements OnInit, OnDestroy {

    /**
     * 策略依赖
     */
    @Input() set data(value: TemplateRefItem[]) {
        if (!value) return;

        this.source = value;

        this.change.next(value.filter(item => item.checked).map(item => item.id));
    }

    /**
     * 输出用户选中的依赖依赖模板
     */
    @Output() change: EventEmitter<number[]> = new EventEmitter();

    /**
     * @ignore
     */
    subscription$$: Subscription;

    /**
     * 可用的模板的数据
     */
    source: TemplateRefItem[] = [];

    constructor(
        private nzModal: NzModalService,
        private strategyService: StrategyService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.launch();
    }

    /**
     * @ignore
     */
    launch() {
        this.subscription$$ = this.strategyService.updateSelectedTemplates(this.change.pipe(
            startWith([])
        ));
    }

    /**
     * 模板依赖发生变化，向外发送数据之前的中间件；
     */
    onChange(target: TemplateRefItem): void {
        if (target.isSnapshot && !target.checked) {
            this.nzModal.warning({
                nzContent: SimpleNzConfirmWrapComponent,
                nzComponentParams: { content: 'RELEASE_SNAPSHOT_TEMPLATE_REFERENCE_WARNING', params: { name: target.name } },
                nzCancelText: null,
                nzOnOk: () => this.emit(),
            });
        } else {
            this.emit();
        }
    }

    /**
     * 向外发送数据
     */
    emit(): void {
        this.change.next(this.source.filter(item => item.checked).map(item => item.id));
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.subscription$$.unsubscribe();
    }
}
