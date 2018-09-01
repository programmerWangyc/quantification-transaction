import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
    @Input() username: string;

    @Output() logout: EventEmitter<boolean> = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
