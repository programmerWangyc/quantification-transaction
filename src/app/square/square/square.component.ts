import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from '../../interfaces/app.interface';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    /**
     * @ignore
     */
    paths: Breadcrumb[] = [{ name: 'STRATEGY_SQUARE' }];

    constructor() { }

    ngOnInit() {
    }

}
