import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { RobotDebugFormModal } from '../../interfaces/constant.interface';
import { BtNode, Platform } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';

@Component({
    selector: 'app-robot-debugger',
    templateUrl: './robot-debugger.component.html',
    styleUrls: ['./robot-debugger.component.scss']
})
export class RobotDebuggerComponent implements OnInit {
    form: FormGroup;

    isCustomStock = false;

    @Input() platforms: Platform[] = [];

    @Input() agents: BtNode[] = [];

    @Input() labelSpan = 6;

    @Input() controlSpan = 16;

    @Input() isDebugging = false;

    @Output() debug: EventEmitter<RobotDebugFormModal> = new EventEmitter();

    constructor(
        private fb: FormBuilder,
        private platformService: PlatformService,

    ) {
        this.initForm();
    }

    ngOnInit() {
    }

    initForm() {
        this.form = this.fb.group({
            agent: ['', Validators.required],
            platform: ['', Validators.required],
            stock: ['', Validators.required]
        });
    }

    get agent(): AbstractControl {
        return this.form.get('agent');
    }

    get stock(): AbstractControl {
        return this.form.get('stock');
    }

    get platform(): AbstractControl {
        return this.form.get('platform');
    }

    get selectedPlatform(): Observable<Platform> {
        return this.platformService.getPlatformList().map(list => list.find(item => item.id === this.platform.value));
    }

    ngOnDestroy() { }
}
