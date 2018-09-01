import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NzModalService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { getTableStatistics } from '../../base/base.service';
import { TableStatistics } from '../../interfaces/app.interface';
import { SaveShadowMemberRequest } from '../../interfaces/request.interface';
import { ShadowMember } from '../../interfaces/response.interface';
import { ModifySubaccountPasswordComponent } from '../modify-subaccount-password/modify-subaccount-password.component';
import {
    ModifySubaccountPermissionComponent
} from '../modify-subaccount-permission/modify-subaccount-permission.component';

@Component({
    selector: 'app-subaccount-list',
    templateUrl: './subaccount-list.component.html',
    styleUrls: ['./subaccount-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubaccountListComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() set accounts(input: ShadowMember[]) {
        if (!!input) {
            this._accounts = input;

            this.statisticsParams = getTableStatistics(input.length, this.pageSize);
        }
    }

    private _accounts: ShadowMember[] = [];

    get accounts(): ShadowMember[] {
        return this._accounts;
    }

    /**
     * @ignore
     */
    @Output() delete: EventEmitter<ShadowMember> = new EventEmitter();

    /**
     * @ignore
     */
    @Output() lock: EventEmitter<ShadowMember> = new EventEmitter();

    /**
     * @ignore
     */
    @Output() update: EventEmitter<SaveShadowMemberRequest> = new EventEmitter();

    /**
     * @ignore
     */
    classMap = [
        'anticon-check-circle-o success',
        'anticon-close-circle-o fail',
    ];

    /**
     * @ignore
     */
    statisticsParams: TableStatistics = { total: 0, page: 0 };

    /**
     * @ignore
     */
    pageSize = 20;

    constructor(
        private nzModal: NzModalService,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

    /**
     * @ignore
     */
    changePassword(target: ShadowMember): void {
        this.updateConfirm(target, ModifySubaccountPasswordComponent).pipe(
            take(1)
        ).subscribe((password: string | null) => {
            const { id, username, permission } = target;

            password && this.update.next({ memberId: id, username, permissions: permission.split(',').map(item => +item), password });
        });
    }

    /**
     * @ignore
     */
    changePermission(target: ShadowMember): void {
        this.updateConfirm(target, ModifySubaccountPermissionComponent).pipe(
            take(1)
        ).subscribe((permissions: number[] | null) => {
            const { id, username } = target;

            permissions && this.update.next({ memberId: id, username, permissions, password: '' });
        });
    }

    /**
     * 参数更新前的操作弹窗
     */
    private updateConfirm(data: ShadowMember, component: any): Observable<any> {
        const modal = this.nzModal.create({
            nzContent: component,
            nzComponentParams: { data },
            nzFooter: null,
        });

        return modal.afterClose;
    }
}
