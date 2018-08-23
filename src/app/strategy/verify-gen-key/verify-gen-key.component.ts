import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';

interface VerifyGenKeyText {
    title: string;
    name: string;
    buttonText: string;
    tip: string;
}

@Component({
    selector: 'app-verify-gen-key',
    templateUrl: './verify-gen-key.component.html',
    styleUrls: ['./verify-gen-key.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyGenKeyComponent implements OnInit {
    @Input() set type(value) {
        this.text = this.texts[value];
    }

    @Input() id: number;

    @Output() verify: EventEmitter<string> = new EventEmitter();

    code = '';

    texts: VerifyGenKeyText[] = [
        { title: 'SHARE_SOURCE_CODE_INNER', name: 'COPY_CODE', buttonText: 'GET_SOURCE_CODE', tip: 'SHARE_INNER_TIP' },
        { title: 'RENT_INNER', name: 'REGISTER_CODE', buttonText: 'RENT', tip: 'RENT_INNER_TIP' },
    ];

    text: VerifyGenKeyText;

    constructor() { }

    ngOnInit() {
    }
}

