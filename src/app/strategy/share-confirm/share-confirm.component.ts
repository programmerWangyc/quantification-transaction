import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { isEqual } from 'lodash';
import { NzModalRef } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export enum ConfirmType {
    NORMAL = 1,
    INNER,
    PUBLIC,
}

/**
 *
 * Input: 1, targetType: Public type that the strategy want to be. 2, currentType: Public type that the strategy is hold on.
 * Output: The param of the close method, indicate the result of user selected.
 *
 * Both the input and output will decide how to handle the next action together.
 */
@Component({
    selector: 'app-share-confirm',
    templateUrl: './share-confirm.component.html',
    styleUrls: ['./share-confirm.component.scss'],
})
export class ShareConfirmComponent implements OnInit {
    @Input() targetType: number;

    @Input() set currentType(value) {
        this._currentType = value;

        this.getMsg();

        this.isCancel = value !== 0;
    }

    get currentType() {
        return this._currentType;
    }

    private _currentType: number;

    tips = new Map([
        [[0, 1], ['SHARE_STRATEGY_CONFIRM', 'PUBLISH']],
        [[0, 2], ['SHARE_STRATEGY_CONFIRM', 'SELL']],
        [[1, 0], ['CANCEL_OPERATE_STRATEGY_CONFIRM', 'PUBLISH']],
        [[2, 0], ['CANCEL_OPERATE_STRATEGY_CONFIRM', 'SELL']],
    ]);

    msg: Observable<string>;

    isCancel = true;

    constructor(
        private translate: TranslateService,
        private modalRef: NzModalRef
    ) { }

    ngOnInit() {

    }

    getMsg() {
        let ary = null;

        const iterator = this.tips.entries();

        while (!ary) {
            const item = iterator.next();

            const [key, value] = item.value;

            if (isEqual(key, [this.currentType, this.targetType])) {
                ary = value;
                break;
            }

            if (item.done) break;
        }

        const [tip, opt] = ary;

        this.msg = this.translate.get(opt).pipe(
            mergeMap(operate => this.translate.get(tip, { operate }))
        );
    }

    close(type = NaN): void {
        this.modalRef.close(type);
    }
}
