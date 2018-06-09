import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { SimpleNzConfirmWrapComponent } from '../../tool/simple-nz-confirm-wrap/simple-nz-confirm-wrap.component';

export interface TemplateRefItem {
    id: number;
    name: string;
    checked: boolean;
    isSnapshot: boolean;

}

@Component({
    selector: 'app-strategy-dependance',
    templateUrl: './strategy-dependance.component.html',
    styleUrls: ['./strategy-dependance.component.scss']
})
export class StrategyDependanceComponent implements OnInit {
    @Input() data: TemplateRefItem[] = [];

    constructor(
        private nzModal: NzModalService,
    ) { }

    ngOnInit() {
    }

    warn(target: TemplateRefItem): void {
        if (!target.isSnapshot || target.checked) return;

        this.nzModal.warning({
            nzContent: SimpleNzConfirmWrapComponent,
            nzComponentParams: { content: 'RELEASE_SNAPSHOT_TEMPLATE_REFERENCE_WARNING', params: { name: target.name } },
            nzCancelText: null,
        });
    }

}
