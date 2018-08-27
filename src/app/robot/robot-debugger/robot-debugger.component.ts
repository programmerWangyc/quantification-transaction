import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BtNode, Platform } from '../../interfaces/response.interface';
import { PlatformService } from '../../providers/platform.service';
import { RobotDebugFormModal } from '../providers/robot.operate.service';

@Component({
    selector: 'app-robot-debugger',
    templateUrl: './robot-debugger.component.html',
    styleUrls: ['./robot-debugger.component.scss'],
})
export class RobotDebuggerComponent implements OnInit {
    form: FormGroup;

    isCustomStock = false;

    @Input() set platforms(input: Platform[]) {
        if (!!input && input.length) {
            this._platforms = input;

            this.platform.patchValue(input[0].id);
        }
    }

    private _platforms: Platform[] = [];

    get platforms(): Platform[] {
        return this._platforms;
    }

    @Input() set agents(input: BtNode[]) {
        if (!!input && input.length) {
            this._agents = input;
            this.agent.patchValue(input[0].id);
        }
    }

    private _agents: BtNode[] = [];

    get agents(): BtNode[] {
        return this._agents;
    }

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
            agent: [null, Validators.required],
            platform: [null, Validators.required],
            stock: [null, Validators.required],
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
        return this.platformService.getPlatformList()
            .pipe(
                map(list => list.find(item => item.id === this.platform.value))
            );
    }

    ngOnDestroy() { }
}
