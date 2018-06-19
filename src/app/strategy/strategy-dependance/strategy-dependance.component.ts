import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';

import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';

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
export class StrategyDependanceComponent implements OnInit {
    @Input() data: TemplateRefItem[] = [];

    @Output() change: EventEmitter<number[]> = new EventEmitter();

    constructor(
        private nzModal: NzModalService,
    ) { }

    ngOnInit() {
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
        this.change.next(this.data.filter(item => item.checked).map(item => item.id));
    }

}
