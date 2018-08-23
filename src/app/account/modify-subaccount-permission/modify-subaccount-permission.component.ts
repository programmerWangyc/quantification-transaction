import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NzModalRef, TransferChange, TransferItem } from 'ng-zorro-antd';
import { take } from 'rxjs/operators';

import { ShadowMember } from '../../interfaces/response.interface';
import { SubaccountService } from '../providers/subaccount.service';

@Component({
    selector: 'app-modify-subaccount-permission',
    templateUrl: './modify-subaccount-permission.component.html',
    styleUrls: ['./modify-subaccount-permission.component.scss'],
})
export class ModifySubaccountPermissionComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() data: ShadowMember;

    /**
     * @ignore
     */
    titles: string[];

    /**
     * @ignore
     */
    operations: string[];

    /**
     * @ignore
     */
    robots: TransferItem[];

    constructor(
        private accountService: SubaccountService,
        private translate: TranslateService,
        private modalRef: NzModalRef,
    ) { }

    /**
     * @ignore
     */
    ngOnInit() {
        this.initialModel();
    }

    /**
     * @ignore
     */
    initialModel(): void {
        this.accountService.getAvailableRobots().pipe(
            take(1),
        ).subscribe(robots => {
            const { permission } = this.data;

            const ids = permission.split(',').map(id => +id);

            this.robots = robots.map(robot => {
                const { name } = robot;

                return { ...robot, title: name, direction: ids.includes(robot.id) ? 'right' : 'left' } as TransferItem;
            });
        });

        this.translate.get(['ALL', 'ADD', 'REMOVE']).subscribe(labels => {
            this.titles = [labels.ALL, this.data.username];

            this.operations = [labels.ADD, labels.REMOVE];
        });
    }

    /**
     * 监听穿梭事件，修改机器人所在位置
     */
    onChange(target: TransferChange): void {
        const { list, to } = target;

        const robots = list.map(item => item.title);

        this.robots.forEach(robot => {
            if (robots.includes(robot.title)) {
                robot.direction = to as 'left' | 'right';
            } else {
                // nothing to do;
            }
        });
    }

    /**
     * @ignore
     */
    close(value?: TransferItem[]) {
        if (!value) {
            return this.modalRef.close(null);
        } else {
            this.modalRef.close(value.filter(item => item.direction === 'right').map(item => item.id));
        }
    }
}
