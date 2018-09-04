import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Partner } from '../../interfaces/response.interface';


@Component({
    selector: 'app-sundry',
    templateUrl: './sundry.component.html',
    styleUrls: ['./sundry.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SundryComponent implements OnInit {
    @Input() data: Partner[];

    constructor() { }

    ngOnInit() {
    }

    open(partner: Partner): void {
        window.open(partner.url);
    }
}
