import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-simple-nz-confirm-wrap',
    templateUrl: './simple-nz-confirm-wrap.component.html',
    styleUrls: ['./simple-nz-confirm-wrap.component.scss']
})
export class SimpleNzConfirmWrapComponent implements OnInit {
    @Input() content: string;

    constructor() { }

    ngOnInit() {
    }

}
