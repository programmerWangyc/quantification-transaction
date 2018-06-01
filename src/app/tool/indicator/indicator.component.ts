import { Component, Input, OnInit } from '@angular/core';

import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-indicator',
    templateUrl: './indicator.component.html',
    styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent implements OnInit {
    @Input() paths: Breadcrumb[];

    constructor() { }

    ngOnInit() {
    }

}
