import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzModalRef } from 'ng-zorro-antd';

import { StrategyShareType } from '../../interfaces/request.interface';

export interface InnerShareFormModel {
    days: number;
    concurrent: number;
}

@Component({
    selector: 'app-inner-share-confirm',
    templateUrl: './inner-share-confirm.component.html',
    styleUrls: ['./inner-share-confirm.component.scss'],
})
export class InnerShareConfirmComponent implements OnInit {
    @Input() set targetType(value) {
        this.isShare = value === StrategyShareType.PUBLISH;

        this.tooltip = this.isShare ? 'MAX_COUNT_OF_RESOURCE_CODE_CAN_COPY' : 'MAX_CONCURRENT_TIP';

        this.extra = this.isShare ? 'COPY_CODE_EXPIRE_AFTER_DAYS' : 'REGISTER_CODE_TIP';
    }

    @Input() currentType: number;

    form: FormGroup;

    isShare = false;

    title: string;

    tooltip: string;

    extra: string;

    constructor(
        private fb: FormBuilder,
        private modalRef: NzModalRef,
    ) {
        this.initForm();
    }

    ngOnInit() {
    }

    initForm() {
        this.form = this.fb.group({
            days: [1, [Validators.required, Validators.min(1)]],
            concurrent: [0, Validators.required],
        });
    }

    close(value) {
        this.modalRef.close(value);
    }
}
