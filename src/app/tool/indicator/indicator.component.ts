import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-indicator',
    templateUrl: './indicator.component.html',
    styleUrls: ['./indicator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorComponent implements OnInit {

    /**
     * @ignore
     */
    @Input() paths: Breadcrumb[];

    constructor() { }

    /**
     * @ignore
     */
    ngOnInit() {
    }

}
