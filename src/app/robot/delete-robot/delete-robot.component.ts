import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
    selector: 'app-delete-robot',
    templateUrl: './delete-robot.component.html',
    styleUrls: ['./delete-robot.component.scss']
})
export class DeleteRobotComponent implements OnInit {
    @Input() set id(id: number) {
        this.message = this.translate.get('DELETE_ROBOT_RELATED_LOG_CONFIRM', { id })
    };

    checked = true;

    message: Observable<string>;

    constructor(
        private translate: TranslateService,
    ) {
    }

    ngOnInit() {
    }
}
